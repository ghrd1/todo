import { NextResponse } from "next/server";
import { prisma } from "./../../../lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    where: {
      parentId: null,
    },
    include: {
      children: true,
    },
  });

  const tasksWithChildren = tasks.map((task: { children: any }) => ({
    ...task,
    children: task.children || [],
  }));

  return NextResponse.json(tasksWithChildren);
}

export async function POST(request: Request) {
  const { title, parentId } = await request.json();

  async function createTask(title: string, parentId: number | null) {
    const newTask = await prisma.task.create({
      data: {
        title,
        parentId,
      },
      include: {
        children: true,
      },
    });

    return {
      ...newTask,
      children: newTask.children || [],
    };
  }

  const createdTask = await createTask(title, parentId);

  return NextResponse.json(createdTask);
}
