"use client";

import { useParams } from 'next/navigation';
import ProjectDetailModular from '@/components/ProjectDetailModular';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  return <ProjectDetailModular projectId={projectId} />;
} 