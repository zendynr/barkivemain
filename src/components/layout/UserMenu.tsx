'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signOutUser, deleteCurrentUser } from '@/lib/firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LogOut, Trash2, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function UserMenu() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({ title: 'Signed out successfully.' });
      router.push('/login');
    } catch (error) {
      console.error('Sign out error', error);
      toast({ variant: 'destructive', title: 'Failed to sign out.' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteCurrentUser();
      toast({ title: 'Account deleted successfully.' });
      router.push('/signup');
    } catch (error: any) {
      console.error('Delete account error', error);
      if (error.code === 'auth/requires-recent-login') {
        toast({
          variant: 'destructive',
          title: 'Action Required',
          description:
            'This is a sensitive action. Please sign out and sign back in before deleting your account.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to delete account.',
          description: error.message,
        });
      }
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Settings className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Account</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
