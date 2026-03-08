import React from 'react';
import WorkspaceInner from './Workspace';
import { WorkspaceProvider } from '../context/WorkspaceContext';

export default function Workspace(props: any) {
  return (
    <WorkspaceProvider initialState={{ files: props.files, status: 'idle' }}>
      <WorkspaceInner {...props} />
    </WorkspaceProvider>
  );
}
