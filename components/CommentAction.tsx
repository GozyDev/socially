import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage } from "./ui/avatar";
import { XIcon,MessageCircleCodeIcon } from "lucide-react";

export function CommentAction({
  handleComment,
  newComment,
  src,
  name
}: {
  getComment: (comment: string) => void;
  handleComment: () => Promise<void>;
  newComment: string;
  src: string;
  name: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="text-blue-500">
          <MessageCircleCodeIcon className="size-5 fill-current"/>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md lg:max-w-xl h-max  bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle></AlertDialogTitle>
          <div className="relative">
            <div className="flex items-center gap-2">
              <Avatar className="h-[40px] w-[40px]">
                <AvatarImage src={src}></AvatarImage>
              </Avatar>
              <p className="text-sm">{name}</p>
            </div>
            <AlertDialogCancel className="absolute top-0 right-0">
              <XIcon></XIcon>
            </AlertDialogCancel>
          </div>
        </AlertDialogHeader>
        <div>
         
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleComment} disabled={!newComment}>
            commment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
