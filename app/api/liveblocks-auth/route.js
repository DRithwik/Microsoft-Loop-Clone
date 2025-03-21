import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCK_SK,
});

export async function POST(request) {
  try {
    // Get the current user from your database
    const user = await currentUser();
    
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get roomId from query parameters
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return new Response("Room ID is required", { status: 400 });
    }

    // Start an auth session inside your endpoint
    const session = liveblocks.prepareSession(
      user.primaryEmailAddress.emailAddress,
      {
        userInfo: {
          name: user.fullName,
          email: user.primaryEmailAddress.emailAddress,
        }
      }
    );

    // Allow access to the specific room
    session.allow(roomId, session.FULL_ACCESS);

    // Authorize the user and return the result
    const { status, body } = await session.authorize();
    return new Response(body, { status });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}