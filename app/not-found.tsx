import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <Button render={<Link href="/" />}>
            <Home className="h-4 w-4 mr-1" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
