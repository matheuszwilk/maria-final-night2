import Header, {
  HeaderLeft,
  HeaderRight,
  HeaderSubtitle,
} from "@/components/header-body";
import SelectProjects from "@/components/select-projects";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { UserNav } from "@/components/usernav";

export default function UserPage() {
  return (
    <BackgroundBeamsWithCollision className="min-h-screen">
      <div className="w-full h-full space-y-12 bg-[#0C0C0C] p-8">
        <Header>
          <HeaderLeft>
            <HeaderSubtitle>H&A Management Portal</HeaderSubtitle>
            <h2 className="text-xl font-semibold text-slate-200">
              Select a project to get started
            </h2>
          </HeaderLeft>
          <HeaderRight>
            <div className="flex flex-wrap gap-4">
              <UserNav />
            </div>
          </HeaderRight>
        </Header>
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <SelectProjects />
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
