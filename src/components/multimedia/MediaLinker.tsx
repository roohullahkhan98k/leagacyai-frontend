import React from 'react';
import LinkingView from './LinkingView';
import { MediaFile, MemoryNode } from '../../services/multimediaApi';

interface MediaLinkerProps {
  selectedNode?: MemoryNode | null;
  selectedMedia?: MediaFile | null;
  onLinkChange?: (linkedMedia: MediaFile[], linkedNodes: MemoryNode[]) => void;
  className?: string;
}

const MediaLinker: React.FC<MediaLinkerProps> = ({
  selectedNode,
  selectedMedia,
  onLinkChange,
  className = '',
}) => {
  return (
    <LinkingView
      selectedNode={selectedNode}
      selectedMedia={selectedMedia}
      onLinkChange={onLinkChange}
      className={className}
    />
  );
};

export default MediaLinker;