"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Users } from "@/app/typesafe";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const user = await currentUser();
    const { userId } = await auth();

    if (!userId || !user) {
      return `signIn oga`;
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return "user exist bitch";
    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        name:`${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("error in sync", error);
  }
}

export async function getUserByCleckId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

export async function getUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await getUserByCleckId(userId);

  if (!user) throw new Error("User Not Found");

  return user.id;
}

export async function getRandomUser():Promise<Users[] | null>{
  try{
    const userId = await getUserId();
    if (!userId) return null;
    const randomUser = prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: { id: userId },
          },
          {
            NOT: {
              followers: { some: { followerId: userId } },
            },
          },
        ],
      },
  
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 4,
    });
  
    return randomUser;
  }
  catch(error){
    console.error(error)
    return []
  }

}

export async function toggleFollow(targetId: string) {

  try{
    const userId = await getUserId();

  if (targetId === userId) throw new Error(`You cant follow your self bitch`);

  // checking for  existing follow

  const existingFollow = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: targetId,
      },
    },
  });

  if (existingFollow) {
    // if following  unfollow

     await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetId,
        },
      },
    });

  } else {
    // if not  following follow

    prisma.$transaction([
      prisma.follows.create({
        data: {
          followerId: userId,
          followingId: targetId,
        },
      }),

      prisma.notification.create({
        data: {
          type: "FOLLOW",
          userId: targetId, // who gets notified
          creatorId: userId, // who did the follow
        },
      }),
    ]);

    revalidatePath("/");
    return { success: true };
  }
  }

  catch(error){
    console.log(`Something went wrong`,error)
    return {success:false}
  }
  
}


