import 'react-contexify/dist/ReactContexify.css';

import { useAtomValue } from 'jotai';
import { MenuProvider } from 'kmenu';
import React, { useCallback, useLayoutEffect } from 'react';
import { ImperativePanelGroupHandle, Panel, PanelGroup } from 'react-resizable-panels';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { isProjectOpenAtom } from '../atoms/projectState';
import { emitEvent } from '../events';
import { ReferencesDropZone } from '../features/references/components/ReferencesDropZone';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { SettingsModalOpener } from '../settings/SettingsModalOpener';
import { ApplicationFrame } from '../wrappers/ApplicationFrame';
import { ContextMenus } from '../wrappers/ContextMenus';
import { EventsListener } from '../wrappers/EventsListener';
import { CommandPalette } from './commands/CommandPalette';
import { MainPanel } from './components/MainPanel';
import { LeftSidePanelWrapper } from './sidebar/LeftSidePanelWrapper';
import { RightSidePanelWrapper } from './sidebar/RightSidePanelWrapper';
import { WebMenuShortcuts } from './WebMenuShortcuts';

export function App() {
  const panelRef = React.createRef<ImperativePanelGroupHandle>();
  const size = useWindowSize();
  const [panelDimensions, setPanelDimensions] = useLocalStorage('refstudio.panels', { left: 400, right: 400 });

  const handleLayoutUpdate = useDebouncedCallback(
    useCallback(
      ([leftPerc, , rightPerc]: number[]) => {
        if (size.width === 0) {
          return;
        }
        const left = Math.round(size.width * (leftPerc / 100));
        const right = Math.round(size.width * (rightPerc / 100));
        setPanelDimensions({ left, right });

        // Notify external components that the screen/layout was resized
        emitEvent('refstudio://layout/update');
      },
      [size, setPanelDimensions],
    ),
    200,
  );

  // React to width resize or panelDimensions resize (via setLayout/resize panels)
  useLayoutEffect(() => {
    if (!panelRef.current || size.width === 0) {
      return;
    }
    const layout = panelRef.current.getLayout();
    const leftPerc = Math.round((panelDimensions.left / size.width) * 100);
    const rightPerc = Math.round((panelDimensions.right / size.width) * 100);
    const centerPerc = 100 - leftPerc - rightPerc;
    const newLayout = [leftPerc, centerPerc, rightPerc];
    if (layout.join(',') !== newLayout.join(',')) {
      panelRef.current.setLayout(newLayout);
    }
  }, [panelRef, size, panelDimensions]);

  const isProjectOpen = useAtomValue(isProjectOpenAtom);

  return (
    <EventsListener>
      <ReferencesDropZone>
        <ApplicationFrame>
          <ContextMenus>
            <MenuProvider config={{ animationDuration: 0 }}>
              <CommandPalette />
              {import.meta.env.VITE_IS_WEB && <WebMenuShortcuts />}
              <PanelGroup
                className="relative h-full"
                direction="horizontal"
                ref={panelRef}
                onLayout={handleLayoutUpdate}
              >
                <LeftSidePanelWrapper disabled={!isProjectOpen} />
                <Panel order={2}>
                  <MainPanel />
                </Panel>
                <RightSidePanelWrapper disabled={!isProjectOpen} />
              </PanelGroup>
            </MenuProvider>
          </ContextMenus>
        </ApplicationFrame>
        <SettingsModalOpener />
      </ReferencesDropZone>
    </EventsListener>
  );
}
