import CreatePost from "@/components/CreatePost";
import ShowPost from "@/components/ShowPost";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";

export default async function PageForTheRoot() {
  const user = await currentUser();
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 ">
        <div className="lg:col-span-6">
          {user ? <CreatePost /> : null}
          {user ? <ShowPost /> : null}
        </div>
        <div className="hidden lg:block lg:col-span-4 sticky top-20">
          {user ? <WhoToFollow /> : null}
        </div>
      </div>
    </>
  );
}
