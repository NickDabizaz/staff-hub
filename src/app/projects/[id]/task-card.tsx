"use client";

import React, { useState } from "react";
import { Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const priorityColors = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export function TaskCard({ 
  task, 
  onDragStart 
}: { 
  task: Task; 
  onDragStart: (e: React.DragEvent, taskId: number) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card 
        className="cursor-move hover:shadow-md transition-shadow"
        draggable
        onDragStart={(e) => onDragStart(e, task.task_id)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{task.task_title}</CardTitle>
            <div className="flex space-x-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{task.task_title}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {task.task_description && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <span className="text-sm text-muted-foreground">Description</span>
                        <span className="col-span-3 text-sm">{task.task_description}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className="col-span-3">
                        <Badge variant="outline">{task.task_status}</Badge>
                      </span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <span className="text-sm text-muted-foreground">Priority</span>
                      <span className="col-span-3">
                        <Badge className={`${priorityColors[task.task_priority]} text-white`}>
                          {task.task_priority}
                        </Badge>
                      </span>
                    </div>
                    {task.task_due_date && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <span className="text-sm text-muted-foreground">Due Date</span>
                        <span className="col-span-3 text-sm">
                          {new Date(task.task_due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="col-span-3 text-sm">{task.task_progress}%</span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {task.task_description && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {task.task_description}
            </p>
          )}
          
          <div className="flex justify-between items-center">
            <Badge 
              className={`${priorityColors[task.task_priority]} text-white`}
            >
              {task.task_priority}
            </Badge>
            
            {task.task_due_date && (
              <span className="text-xs text-gray-500">
                {new Date(task.task_due_date).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {task.assignee_user_id && (
            <div className="mt-3 flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">
                U
              </div>
              <span className="ml-2 text-sm">User {task.assignee_user_id}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}