"use client";

import React from "react";
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskTodos } from "./task-todos";

const priorityColors = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

const statusColors = {
  TODO: "bg-gray-500",
  IN_PROGRESS: "bg-blue-500",
  DONE: "bg-green-500",
  BLOCKED: "bg-red-500",
};

export function TaskDetail({ task }: { task: Task }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{task.task_title}</h2>
          <div className="flex gap-2 mt-2">
            <Badge className={`${statusColors[task.task_status]} text-white`}>
              {task.task_status.replace("_", " ")}
            </Badge>
            <Badge className={`${priorityColors[task.task_priority]} text-white`}>
              {task.task_priority}
            </Badge>
          </div>
        </div>
        <Button>Tandai Selesai</Button>
      </div>

      {task.task_description && (
        <Card>
          <CardHeader>
            <CardTitle>Deskripsi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{task.task_description}</p>
          </CardContent>
        </Card>
      )}

      {/* Task Todos Section */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskTodos taskId={task.task_id} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Proyek</span>
              <span>Nama Proyek</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Assignee</span>
              <span>User {task.assignee_user_id || "Belum diassign"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tanggal Selesai</span>
              <span>
                {task.task_due_date 
                  ? new Date(task.task_due_date).toLocaleDateString("id-ID") 
                  : "Tidak ada tenggat waktu"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Progress</span>
              <span>{task.task_progress}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Edit Task
            </Button>
            <Button className="w-full" variant="outline">
              Tambah Komentar
            </Button>
            <Button className="w-full" variant="outline">
              Lampirkan File
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}