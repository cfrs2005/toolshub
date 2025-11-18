import React from 'react';
import type { PluginManifest } from '../../shared/types';
import PluginCard from './PluginCard';
import './PluginList.css';

interface PluginListProps {
  plugins: PluginManifest[];
  onSelect: (pluginId: string) => void;
}

const PluginList: React.FC<PluginListProps> = ({ plugins, onSelect }) => {
  return (
    <div className="plugin-list">
      {plugins.map((plugin) => (
        <PluginCard
          key={plugin.id}
          plugin={plugin}
          onSelect={onSelect}
          showActivateButton={false}
        />
      ))}
    </div>
  );
};

export default PluginList;
