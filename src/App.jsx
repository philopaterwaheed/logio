import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Menubar } from 'primereact/menubar';
import { VirtualScroller } from 'primereact/virtualscroller';


let items = [
    {
        label: 'File',
        icon: 'pi pi-fw pi-file',
        items: [
            {
                label: 'Open Log File',
                icon: 'pi pi-fw pi-folder-open',
                command: () => { console.log('Open log file'); }
            },
            {
                label: 'Open Directory',
                icon: 'pi pi-fw pi-folder',
                command: () => { console.log('Open directory'); }
            },
            {
                label: 'Recent Files',
                icon: 'pi pi-fw pi-clock',
                items: [
                    { label: 'app.log', icon: 'pi pi-fw pi-file' },
                    { label: 'error.log', icon: 'pi pi-fw pi-file' },
                    { label: 'access.log', icon: 'pi pi-fw pi-file' }
                ]
            },
            {
                separator: true
            },
            {
                label: 'Export',
                icon: 'pi pi-fw pi-download',
                items: [
                    { label: 'Export as CSV', icon: 'pi pi-fw pi-file-excel' },
                    { label: 'Export as JSON', icon: 'pi pi-fw pi-file' },
                    { label: 'Export as TXT', icon: 'pi pi-fw pi-file-edit' }
                ]
            },
            {
                separator: true
            },
            {
                label: 'Exit',
                icon: 'pi pi-fw pi-times',
                command: () => { console.log('Exit application'); }
            }
        ]
    },
    {
        label: 'View',
        icon: 'pi pi-fw pi-eye',
        items: [
            {
                label: 'Filter',
                icon: 'pi pi-fw pi-filter',
                items: [
                    { label: 'Show All Levels', icon: 'pi pi-fw pi-list' },
                    { label: 'Errors Only', icon: 'pi pi-fw pi-exclamation-triangle' },
                    { label: 'Warnings Only', icon: 'pi pi-fw pi-exclamation-circle' },
                    { label: 'Info Only', icon: 'pi pi-fw pi-info-circle' },
                    { label: 'Debug Only', icon: 'pi pi-fw pi-bug' }
                ]
            },
            {
                label: 'Search',
                icon: 'pi pi-fw pi-search',
                command: () => { console.log('Open search'); }
            },
            {
                label: 'Go to Line',
                icon: 'pi pi-fw pi-arrow-right',
                command: () => { console.log('Go to line'); }
            },
            {
                separator: true
            },
            {
                label: 'Refresh',
                icon: 'pi pi-fw pi-refresh',
                command: () => { console.log('Refresh logs'); }
            },
            {
                label: 'Auto-refresh',
                icon: 'pi pi-fw pi-sync',
                command: () => { console.log('Toggle auto-refresh'); }
            },
            {
                separator: true
            },
            {
                label: 'Split View',
                icon: 'pi pi-fw pi-window-maximize',
                command: () => { console.log('Toggle split view'); }
            },
            {
                label: 'Full Screen',
                icon: 'pi pi-fw pi-window-maximize',
                command: () => { console.log('Toggle fullscreen'); }
            }
        ]
    },
    {
        label: 'Analysis',
        icon: 'pi pi-fw pi-chart-line',
        items: [
            {
                label: 'Statistics',
                icon: 'pi pi-fw pi-chart-bar',
                command: () => { console.log('Show statistics'); }
            },
            {
                label: 'Error Analysis',
                icon: 'pi pi-fw pi-exclamation-triangle',
                command: () => { console.log('Analyze errors'); }
            },
            {
                label: 'Performance Metrics',
                icon: 'pi pi-fw pi-stopwatch',
                command: () => { console.log('Show performance metrics'); }
            },
            {
                label: 'Timeline View',
                icon: 'pi pi-fw pi-calendar',
                command: () => { console.log('Show timeline'); }
            },
            {
                separator: true
            },
            {
                label: 'Generate Report',
                icon: 'pi pi-fw pi-file-pdf',
                command: () => { console.log('Generate report'); }
            }
        ]
    },
    {
        label: 'Tools',
        icon: 'pi pi-fw pi-wrench',
        items: [
            {
                label: 'Log Parser',
                icon: 'pi pi-fw pi-cog',
                command: () => { console.log('Open log parser'); }
            },
            {
                label: 'Regex Tester',
                icon: 'pi pi-fw pi-code',
                command: () => { console.log('Open regex tester'); }
            },
            {
                label: 'Log Formatter',
                icon: 'pi pi-fw pi-align-left',
                command: () => { console.log('Format logs'); }
            },
            {
                separator: true
            },
            {
                label: 'Bookmarks',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    { label: 'Add Bookmark', icon: 'pi pi-fw pi-plus' },
                    { label: 'Manage Bookmarks', icon: 'pi pi-fw pi-list' }
                ]
            },
            {
                label: 'Custom Filters',
                icon: 'pi pi-fw pi-filter-fill',
                command: () => { console.log('Manage custom filters'); }
            },
            {
                separator: true
            },
            {
                label: 'Preferences',
                icon: 'pi pi-fw pi-cog',
                command: () => { console.log('Open preferences'); }
            }
        ]
    },
    {
        label: 'Monitor',
        icon: 'pi pi-fw pi-desktop',
        items: [
            {
                label: 'Real-time Monitoring',
                icon: 'pi pi-fw pi-play',
                command: () => { console.log('Start real-time monitoring'); }
            },
            {
                label: 'Tail Log File',
                icon: 'pi pi-fw pi-fast-forward',
                command: () => { console.log('Tail log file'); }
            },
            {
                label: 'Watch Directory',
                icon: 'pi pi-fw pi-folder-open',
                command: () => { console.log('Watch directory for changes'); }
            },
            {
                separator: true
            },
            {
                label: 'Alerts',
                icon: 'pi pi-fw pi-bell',
                items: [
                    { label: 'Configure Alerts', icon: 'pi pi-fw pi-cog' },
                    { label: 'Alert History', icon: 'pi pi-fw pi-history' },
                    { label: 'Test Alert', icon: 'pi pi-fw pi-send' }
                ]
            },
            {
                label: 'Notifications',
                icon: 'pi pi-fw pi-volume-up',
                command: () => { console.log('Configure notifications'); }
            }
        ]
    },
    {
        label: 'Help',
        icon: 'pi pi-fw pi-question-circle',
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-book',
                command: () => { console.log('Open documentation'); }
            },
            {
                label: 'Keyboard Shortcuts',
                icon: 'pi pi-fw pi-key',
                command: () => { console.log('Show shortcuts'); }
            },
            {
                label: 'Log Format Guide',
                icon: 'pi pi-fw pi-info',
                command: () => { console.log('Show log format guide'); }
            },
            {
                separator: true
            },
            {
                label: 'Check for Updates',
                icon: 'pi pi-fw pi-cloud-download',
                command: () => { console.log('Check for updates'); }
            },
            {
                label: 'About',
                icon: 'pi pi-fw pi-info-circle',
                command: () => { console.log('Show about dialog'); }
            }
        ]
    }
];

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [leftPanelItems, setLeftPanelItems] = useState([]);
  const [rightPanelItems, setRightPanelItems] = useState([]);

  // Generate sample data
  useEffect(() => {
    // Sample left panel data (e.g., log files)
    const leftItems = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `log_file_${i + 1}.log`,
      size: `${Math.floor(Math.random() * 100) + 1} KB`,
      modified: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString()
    }));
    
    // Sample right panel data (e.g., log entries)
    const rightItems = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      level: ['INFO', 'ERROR', 'WARN', 'DEBUG'][Math.floor(Math.random() * 4)],
      message: `Log message ${i + 1}: This is a sample log entry with some details about what happened in the application.`,
    }));
    
    setLeftPanelItems(leftItems);
    setRightPanelItems(rightItems);
  }, []);

  // Item template for left panel
  const leftItemTemplate = (item) => {
    return (
      <div className="list-item">
        <div className="item-name">{item.name}</div>
        <div className="item-details">
          <span className="item-size">{item.size}</span>
          <span className="item-modified">{item.modified}</span>
        </div>
      </div>
    );
  };

  // Item template for right panel
  const rightItemTemplate = (item) => {
    return (
      <div className={`list-item log-entry log-${item.level.toLowerCase()}`}>
        <div className="log-header">
          <span className="log-timestamp">{new Date(item.timestamp).toLocaleTimeString()}</span>
          <span className={`log-level level-${item.level.toLowerCase()}`}>{item.level}</span>
        </div>
        <div className="log-message">{item.message}</div>
      </div>
    );
  };

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="app">
      <Menubar model={items} className="menubar-fixed" />    
      
      <div className="split-container">
        <div className="left-panel">
          <h3>Log Files</h3>
          <div className="panel-content">
            <VirtualScroller
              items={leftPanelItems}
              itemSize={60}
              itemTemplate={leftItemTemplate}
              className="virtual-scroller"
              style={{ width: '100%', height: 'calc(100vh - 140px)' }}
            />
          </div>
        </div>
        
        <div className="right-panel">
          <h3>Log Entries</h3>
          <div className="panel-content">
            <VirtualScroller
              items={rightPanelItems}
              itemSize={80}
              itemTemplate={rightItemTemplate}
              className="virtual-scroller"
              style={{ width: '100%', height: 'calc(100vh - 140px)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
