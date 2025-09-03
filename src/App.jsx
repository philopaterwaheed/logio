import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Menubar } from 'primereact/menubar';


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

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="app">
      <Menubar model={items} className="menubar-fixed" />    
      
      <main className="container">
        <h1>Welcome to Tauri + React</h1>

      <div className="row">
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
    </div>
  );
}

export default App;
