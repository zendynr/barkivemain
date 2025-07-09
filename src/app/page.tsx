import { UserProfile } from '@/components/dashboard/UserProfile';
import { MealTracker } from '@/components/dashboard/MealTracker';
import { pet, feedingLogs } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Footprints, Camera, Syringe } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-gray-900">
            Welcome back!
          </h1>
          <p className="text-gray-700">Here's a summary of how {pet.name} is doing.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <UserProfile pet={pet} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickLinkCard href="/activity" icon={Footprints} title="Activity" description="View walk and play logs" color="text-mint-green" />
              <QuickLinkCard href="/memories" icon={Camera} title="Memories" description="See recent photos" color="text-lavender" />
              <QuickLinkCard href="/health" icon={Syringe} title="Health" description="Get care tips" color="text-coral-blush" />
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <MealTracker feedingLogs={feedingLogs} />
            <Card className="rounded-2xl shadow-md bg-coral-blush/20">
              <CardHeader>
                <CardTitle className="font-headline text-xl">Feeding History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">View a detailed history of all meals and treats.</p>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/feeding">
                    View History <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({ href, icon: Icon, title, description, color }: { href: string; icon: React.ElementType; title: string; description: string, color: string }) {
  return (
    <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex flex-col items-center text-center gap-2">
        <Icon className={cn("w-10 h-10 mb-2", color)} />
        <p className="font-bold text-lg text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <Button asChild variant="outline" size="sm">
            <Link href={href}>Go to {title}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
