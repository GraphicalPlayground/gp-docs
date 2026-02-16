import React, { useState, type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  highlight?: boolean;
}

interface FileTreeProps {
  data: FileNode[];
  className?: string;
}

interface FileTreeNodeProps {
  node: FileNode;
  depth?: number;
}

function FileTreeNode({ node, depth = 0 }: FileTreeNodeProps): ReactNode {
  const [isOpen, setIsOpen] = useState(depth < 2); // Auto-expand first 2 levels
  const isFolder = node.type === 'folder';
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    if (isFolder && hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={styles.treeNode} style={{ '--tree-depth': depth } as React.CSSProperties}>
      <div
        className={clsx(styles.nodeContent, {
          [styles.highlighted]: node.highlight,
          [styles.clickable]: isFolder && hasChildren
        })}
        onClick={handleToggle}
      >
        {isFolder && hasChildren && <span className={clsx(styles.chevron, { [styles.open]: isOpen })}>▶</span>}
        {isFolder && !hasChildren && <span className={styles.chevronPlaceholder} />}
        <span className={clsx(styles.icon, isFolder ? styles.folderIcon : styles.fileIcon)}>
          {isFolder ? <i className='eds-icon icon-folder-filled'></i> : <i className='eds-icon icon-file'></i>}
        </span>
        <span className={styles.nodeName}>{node.name}</span>
      </div>
      {isFolder && hasChildren && isOpen && (
        <div className={styles.children}>
          {node.children!.map((child, index) => (
            <FileTreeNode key={`${child.name}-${index}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ data, className }: FileTreeProps): ReactNode {
  return (
    <div className={clsx(styles.fileTree, className)}>
      {data.map((node, index) => (
        <FileTreeNode key={`${node.name}-${index}`} node={node} depth={0} />
      ))}
    </div>
  );
}
