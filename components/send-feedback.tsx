'use client';

import { sendFeedback } from '@/actions/feedback';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@mosespace/toast';
import { Hand, Loader } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Textarea } from './ui/textarea';

const FormSchema = z.object({
  message: z.string().min(2, {
    message: 'Message must be at least 2 characters.',
  }),
  userId: z.string().optional(),
});

export const SendFeedback = ({ user }: any) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      message: '',
      userId: user?.id || '',
    },
  });

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const userId = '1';

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    // console.log('Data:', data);

    if (userId) {
      const req = await sendFeedback(data);
      if (req.status === 201) {
        toast.success('Success', 'Feedback has been submitted');
        form.reset();
      } else {
        toast.error('Error', 'Failed to submit feedback');
      }
      setLoading(false);
    } else {
      setLoading(false);
      // router.push('/login');
    }

    setIsOpen(false);
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 z-10 group inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full"
        >
          <div className="transition duration-300 group-hover:rotate-[360deg]">
            <Hand className="size-8 text-brandColor -rotate-12" />
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="space-y-4 pb-4 lg:pb-9">
        <DrawerHeader>
          <DrawerTitle className="text-center lg:text-3xl">
            What feature would you like to see next?
          </DrawerTitle>
          <DrawerDescription className="text-center lg:text-xl">
            Send it, and.. I’ll build it for you 🤩
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-2 max-w-2xl mx-auto px-4"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className="h-24"
                      placeholder="Enter request here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={loading}
              className="flex bg-primary/80 text-white items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              send feedback
            </Button>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
};
