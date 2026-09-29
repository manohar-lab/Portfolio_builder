import React from "react";
import { notFound, redirect } from "next/navigation";
import { getPortfolioFullData } from "@/database/portfolio-service";
import { EditorProvider } from "@/editor/EditorContext";
import { EditorLayout } from "@/editor/EditorLayout";

interface EditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PortfolioEditorPage({ params }: EditorPageProps) {
  const { id } = await params;

  if (!id) {
    redirect("/dashboard");
  }

  const portfolio = await getPortfolioFullData(id);

  if (!portfolio) {
    notFound();
  }

  return (
    <EditorProvider initialData={portfolio}>
      <EditorLayout />
    </EditorProvider>
  );
}
