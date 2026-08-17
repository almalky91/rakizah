'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

export default function TestComponentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm();

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">shadcn/ui Components Test</h1>

      {/* Button Test */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Button Component</h2>
        <div className="flex gap-2">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>

      {/* Dialog Test */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Dialog Component</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>
                This is a test dialog to verify that the Dialog component works correctly with Next.js.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Select Test */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Select Component</h2>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dropdown Menu Test */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Dropdown Menu Component</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Toast Test */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Toast Component</h2>
        <div className="flex gap-2">
          <Button onClick={() => toast.success('Success toast!')}>Show Success Toast</Button>
          <Button onClick={() => toast.error('Error toast!')} variant="destructive">Show Error Toast</Button>
          <Button onClick={() => toast.info('Info toast!')} variant="secondary">Show Info Toast</Button>
        </div>
      </div>

      {/* Form Test */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Form Component</h2>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((data) => toast.success('Form submitted!'))}>
            <FormField
              control={form.control}
              name="testField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Field</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter text..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit Form</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
