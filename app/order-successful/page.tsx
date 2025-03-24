import { Check, ChevronRight, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderSuccess() {
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4 md:py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Pöntun tókst!</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Takk fyrir viðskiptin. Við höfum móttekið pöntunina þína og hún er í
          vinnslu.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>
                Þú munt fá tölvupóst með staðfestingu á pöntuninni og
                upplýsingar um afhendingu.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Button asChild>
          <Link href="/shop">
            Halda áfram að versla
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
