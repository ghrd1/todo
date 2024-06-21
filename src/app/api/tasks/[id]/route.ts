import { NextResponse } from "next/server";
import { prisma } from "./../../../../lib/prisma";

async function deleteTaskAndSubtasks(id: number) {
  const subtasks = await prisma.task.findMany({
    where: {
      parentId: id,
    },
  });

  for (const subtask of subtasks) {
    await deleteTaskAndSubtasks(subtask.id);
  }

  await prisma.task.delete({
    where: {
      id: id,
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await deleteTaskAndSubtasks(Number(id));

  return NextResponse.json({ message: "Task and its subtasks deleted" });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { title, parentId } = await request.json();

    const data: any = {};
    if (title) data.title = title;
    if (parentId !== undefined) data.parentId = parentId;

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Ошибка при обновлении задачи:", error);
    return NextResponse.json({ error: "Ошибка при обновлении задачи" });
  }
}
