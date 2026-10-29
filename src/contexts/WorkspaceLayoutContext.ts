import {createContext} from 'react';

export interface WorkspaceLayout {
  /**
   * How much wider than its pane the search dock may grow, to the right, while
   * the keyboard is up: the detail pane's width when the two sit side by side.
   * Zero when the browser already spans the workspace, and zero beside a fold
   * (nothing may sit on the crease).
   */
  dockExpansion: number;
}

const WorkspaceLayoutContext = createContext<WorkspaceLayout>({dockExpansion: 0});

export default WorkspaceLayoutContext;
