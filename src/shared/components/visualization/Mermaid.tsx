// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 *  █████╗ ██████╗  █████╗ ███████╗
 * ██╔══██╗██╔══██╗██╔══██╗██╔════╝
 * ███████║██████╔╝███████║███████╗
 * ██╔══██║██╔══██╗██╔══██║╚════██║
 * ██║  ██║██║  ██║██║  ██║███████║
 * ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
 *
 * Copyright (C) 2025 Rıza Emre ARAS <r.emrearas@proton.me>
 *
 * This file is part of ARTEK Homepage.
 *
 * ARTEK Homepage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// React
import React, { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';

// External libraries - Carbon React
import { IconButton, ButtonSet, InlineNotification, Button, Modal } from '@carbon/react';

// External libraries - Carbon Icons
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Renew,
  Copy,
  Download,
  Reset,
  Restart,
} from '@carbon/icons-react';

// Third-party libraries
import mermaid from 'mermaid';

// Internal modules
import { useIsClient, useLocale } from '@shared/hooks';
import { translate } from '@shared/translations';

// Local components
import ChartLoader from './ChartLoader';

// Styles
import './styles/Mermaid.scss';
import LoadingSpinner from '@shared/components/ui/LoadingSpinner.tsx';

interface MermaidProps {
  chart: string;
}

type LoadingState = 'loading' | 'success' | 'error';

/**
 * MermaidInner - Core diagram rendering component
 * Contains all business logic and hooks
 */
const MermaidInner: React.FC<MermaidProps> = ({ chart }) => {
  // Localization
  const { locale } = useLocale();
  const t = translate(locale);

  // Core refs
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);

  // State management
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [svgContent, setSvgContent] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  // Control states for main view
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Constants
  const MAX_ZOOM = 2;
  const MIN_ZOOM = 0.5;
  const MAX_PAN = 300;
  const MOBILE_BREAKPOINT = 672;

  // Mobile detection for touch guard (pan/zoom disabled on mobile)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const getCurrentTheme = useCallback((): 'neutral' | 'dark' => {
    const carbonTheme = document.documentElement.getAttribute('data-carbon-theme');
    return carbonTheme === 'white' ? 'neutral' : 'dark';
  }, []);

  const getMermaidConfig = useCallback(() => {
    const currentMermaidTheme = getCurrentTheme();
    return {
      startOnLoad: false,
      theme: currentMermaidTheme,
      securityLevel: 'loose' as const,
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis' as const,
        nodeSpacing: 50,
        rankSpacing: 50,
        padding: 15,
        defaultRenderer: 'dagre-wrapper' as const,
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 30,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        useMaxWidth: false,
      },
      themeVariables: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
        fontSize: '16px',
      },
    };
  }, []);

  const processSvg = useCallback((svgElement: SVGElement): string => {
    svgElement.style.maxWidth = '100%';
    svgElement.style.height = 'auto';

    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const [, , width, height] = viewBox.split(' ').map(Number);
      const aspectRatio = width / height;

      if (aspectRatio > 2) {
        svgElement.style.width = '100%';
        svgElement.style.maxHeight = '400px';
      } else if (aspectRatio < 0.5) {
        svgElement.style.maxWidth = '500px';
        svgElement.style.height = 'auto';
      } else {
        svgElement.style.width = 'auto';
        svgElement.style.maxWidth = '100%';
        svgElement.style.maxHeight = '500px';
      }
    }

    const textElements = svgElement.querySelectorAll('text');
    textElements.forEach((text) => {
      const fontSize = parseInt(window.getComputedStyle(text).fontSize);
      if (fontSize < 12) {
        text.style.fontSize = '12px';
      }
    });

    return svgElement.outerHTML;
  }, []);

  // Clean SVG and store for modal use
  const cleanAndStoreSvg = useCallback((svgElement: SVGElement) => {
    const cleanSvg = svgElement.cloneNode(true) as SVGElement;
    cleanSvg.removeAttribute('style');
    cleanSvg.style.width = '';
    cleanSvg.style.height = '';
    cleanSvg.style.maxWidth = '';
    cleanSvg.style.maxHeight = '';
    setSvgContent(cleanSvg.outerHTML);
  }, []);

  const renderDiagram = useCallback(async () => {
    if (!chart) return;

    setLoadingState('loading');
    setErrorMessage('');

    // Wait for container to be ready with retry mechanism
    let retries = 0;
    const maxRetries = 10;
    while (!containerRef.current && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }

    if (!containerRef.current) {
      console.error('Container ref not ready after retries');
      setErrorMessage(t.mermaid.error.containerNotReady);
      setLoadingState('error');
      return;
    }

    containerRef.current.innerHTML = '';

    try {
      // Generate unique ID to avoid conflicts
      renderCountRef.current += 1;
      const diagramId = `mermaid-${Date.now()}-${renderCountRef.current}-${Math.random().toString(36).substring(2, 11)}`;

      mermaid.initialize(getMermaidConfig());
      const { svg } = await mermaid.render(diagramId, chart);

      if (!svg || svg.trim() === '') {
        setErrorMessage(t.mermaid.error.emptyContent);
        setLoadingState('error');
        return;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = svg;

        // Wait for DOM to update before processing
        await new Promise((resolve) => setTimeout(resolve, 50));

        const svgElement = containerRef.current.querySelector('svg');
        if (!svgElement) {
          setErrorMessage(t.mermaid.error.svgNotFound);
          setLoadingState('error');
          return;
        }

        if (svgElement.childNodes.length === 0 && svgElement.innerHTML.trim() === '') {
          setErrorMessage(t.mermaid.error.svgEmpty);
          setLoadingState('error');
          return;
        }

        processSvg(svgElement);
        cleanAndStoreSvg(svgElement);

        // Wait for styles to apply before calculating height
        await new Promise((resolve) => setTimeout(resolve, 100));
        const svgRect = svgElement.getBoundingClientRect();
        if (svgRect.height > 0) {
          const isSmallScreen = window.innerWidth < 672; // Carbon sm breakpoint
          const scaleFactor = isSmallScreen ? 0.65 : 0.98; // Match SCSS scale values
          const calculatedHeight = svgRect.height * scaleFactor + (isSmallScreen ? 0 : 48);
          setContainerHeight(calculatedHeight);
        }

        setLoadingState('success');
      }
    } catch (error) {
      console.error('Mermaid rendering error:', error);

      let message = t.mermaid.error.renderFailed;
      if (error instanceof Error) {
        if (error.message.includes('Parse')) {
          message = t.mermaid.error.syntaxError;
        } else if (error.message.includes('Unknown')) {
          message = t.mermaid.error.unsupportedType;
        } else if (error.message.includes('Duplicate')) {
          // Retry once for duplicate ID errors
          await new Promise((resolve) => setTimeout(resolve, 500));

          try {
            const retryId = `mermaid-retry-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            mermaid.initialize(getMermaidConfig());
            const { svg: retrySvg } = await mermaid.render(retryId, chart);

            if (retrySvg && containerRef.current) {
              containerRef.current.innerHTML = retrySvg;
              const svgEl = containerRef.current.querySelector('svg');
              if (svgEl) {
                processSvg(svgEl);
                cleanAndStoreSvg(svgEl);

                await new Promise((resolve) => setTimeout(resolve, 100));
                const svgRect = svgEl.getBoundingClientRect();
                if (svgRect.height > 0) {
                  const isSmallScreen = window.innerWidth < 672;
                  const scaleFactor = isSmallScreen ? 0.65 : 0.98;
                  const calculatedHeight = svgRect.height * scaleFactor + (isSmallScreen ? 0 : 48);
                  setContainerHeight(calculatedHeight);
                }

                setLoadingState('success');
                return;
              }
            }
          } catch {
            // Retry failed, continue with error handling
          }
        } else {
          message = error.message;
        }
      }

      setErrorMessage(message);
      setLoadingState('error');

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
  }, [chart, getMermaidConfig, processSvg, cleanAndStoreSvg]);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is fully ready
    const rafId = requestAnimationFrame(() => {
      void renderDiagram();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-carbon-theme') {
          void renderDiagram();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-carbon-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, [renderDiagram]);

  const handleRefresh = useCallback(() => {
    setPanPosition({ x: 0, y: 0 });
    setZoomLevel(1);
    void renderDiagram();
  }, [renderDiagram]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, MAX_ZOOM));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, MIN_ZOOM));
  const handleResetZoom = () => setZoomLevel(1);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanPosition({
        x: Math.max(-MAX_PAN, Math.min(e.clientX - dragStart.x, MAX_PAN)),
        y: Math.max(-MAX_PAN, Math.min(e.clientY - dragStart.y, MAX_PAN)),
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - panPosition.x,
        y: touch.clientY - panPosition.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      setPanPosition({
        x: Math.max(-MAX_PAN, Math.min(touch.clientX - dragStart.x, MAX_PAN)),
        y: Math.max(-MAX_PAN, Math.min(touch.clientY - dragStart.y, MAX_PAN)),
      });
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagram-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <div className="mermaid-wrapper">
        <div className="mermaid-tile">
          {loadingState === 'loading' && (
            <div className="mermaid-loading-container">
              <InlineNotification
                kind="info"
                title={t.mermaid.loading.title}
                subtitle={t.mermaid.loading.subtitle}
                lowContrast
                hideCloseButton
              />
              <div className="mermaid-loading-details">
                <div className="mermaid-loading-center">
                  <LoadingSpinner></LoadingSpinner>
                </div>
              </div>
            </div>
          )}

          {loadingState === 'error' && (
            <div className="mermaid-error-container">
              <InlineNotification
                kind="error"
                title={t.mermaid.error.title}
                subtitle={t.mermaid.error.subtitle}
                lowContrast
                hideCloseButton
              />
              <div className="mermaid-error-details">
                <p className="mermaid-error-message">{errorMessage}</p>
                <p className="mermaid-error-help">{t.mermaid.error.helpTitle}</p>
                <ul className="mermaid-error-list">
                  <li>{t.mermaid.error.commonErrors.arrows}</li>
                  <li>{t.mermaid.error.commonErrors.specialChars}</li>
                  <li>{t.mermaid.error.commonErrors.indentation}</li>
                  <li>{t.mermaid.error.commonErrors.unsupported}</li>
                </ul>
                <details className="mermaid-error-code">
                  <summary>{t.mermaid.error.codeTitle}</summary>
                  <pre>{chart}</pre>
                </details>
                <div className="mermaid-error-actions">
                  <Button renderIcon={Restart} kind="secondary" size="sm" onClick={handleRefresh}>
                    {t.mermaid.error.retry}
                  </Button>
                  <Button kind="ghost" size="sm" onClick={handleCopy}>
                    {t.mermaid.error.copyCode}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {loadingState === 'success' && (
            <div className="mermaid-controls">
              <ButtonSet>
                <IconButton
                  kind="ghost"
                  size="sm"
                  label={t.mermaid.controls.zoomIn}
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= MAX_ZOOM}
                >
                  <ZoomIn />
                </IconButton>
                <IconButton
                  kind="ghost"
                  size="sm"
                  label={t.mermaid.controls.zoomOut}
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= MIN_ZOOM}
                >
                  <ZoomOut />
                </IconButton>
                <IconButton
                  kind="ghost"
                  size="sm"
                  label={t.mermaid.controls.resetZoom}
                  onClick={handleResetZoom}
                  disabled={zoomLevel === 1}
                >
                  <Reset />
                </IconButton>
                <div className="mermaid-controls__separator" />
                <IconButton
                  kind="ghost"
                  size="sm"
                  label={t.mermaid.controls.fullscreen}
                  onClick={() => setIsFullscreen(true)}
                >
                  <Maximize />
                </IconButton>
                <IconButton
                  kind="ghost"
                  size="sm"
                  label={t.mermaid.controls.copyCode}
                  onClick={handleCopy}
                >
                  <Copy />
                </IconButton>
                <IconButton
                  kind="ghost"
                  size="sm"
                  label={t.mermaid.controls.download}
                  onClick={handleDownload}
                >
                  <Download />
                </IconButton>
                <IconButton
                  kind="ghost"
                  size="sm"
                  label={t.mermaid.controls.refresh}
                  onClick={handleRefresh}
                >
                  <Renew />
                </IconButton>
              </ButtonSet>
              <span className="mermaid-controls__zoom-level">{Math.round(zoomLevel * 100)}%</span>
            </div>
          )}

          <div
            className="mermaid-container-wrapper"
            ref={wrapperRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            {...(!isMobile && {
              onTouchStart: handleTouchStart,
              onTouchMove: handleTouchMove,
              onTouchEnd: handleTouchEnd,
            })}
            style={{
              cursor: loadingState === 'success' && !isMobile ? (isDragging ? 'grabbing' : 'grab') : 'default',
              display: loadingState === 'success' ? 'flex' : 'none',
              ...(containerHeight && {
                height: `${containerHeight}px`,
                minHeight: `${containerHeight}px`,
              }),
            }}
          >
            <div
              ref={containerRef}
              className="mermaid-container"
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center',
                transition: isDragging ? 'none' : 'transform 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      <Modal
        open={isFullscreen}
        onRequestClose={() => setIsFullscreen(false)}
        modalHeading=""
        primaryButtonText={t.mermaid.modal.close}
        secondaryButtonText=""
        onRequestSubmit={() => setIsFullscreen(false)}
        className="mermaid-fullscreen-modal"
      >
        <div dangerouslySetInnerHTML={{ __html: svgContent }} />
      </Modal>
    </>
  );
};

/**
 * Mermaid - Wrapper component with pre-rendering guard
 * Only renders MermaidInner on client-side
 */
const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const isClient = useIsClient();
  const { locale } = useLocale();
  const t = translate(locale);

  if (!isClient) {
    return (
      <div className="mermaid-loading-container">
        <InlineNotification
          kind="info"
          title={t.mermaid.loading.title}
          subtitle={t.mermaid.loading.subtitle}
          lowContrast
          hideCloseButton
        />
        <div className="mermaid-loading-details">
          <div className="mermaid-loading-center">
            <LoadingSpinner></LoadingSpinner>
          </div>
        </div>
      </div>
    );
  }

  return <MermaidInner chart={chart} />;
};

// Lazy-loaded version with built-in Suspense boundary and ChartLoader
const LazyMermaidComponent = lazy(() => Promise.resolve({ default: Mermaid }));

const LazyMermaid: React.FC<MermaidProps> = (props) => (
  <Suspense fallback={<ChartLoader height="500px" />}>
    <LazyMermaidComponent {...props} />
  </Suspense>
);

// Composition pattern: Attach Lazy as a property
interface MermaidComponent extends React.FC<MermaidProps> {
  Lazy: React.FC<MermaidProps>;
}

const MermaidWithLazy = Object.assign(Mermaid, {
  Lazy: LazyMermaid,
}) as MermaidComponent;

export default MermaidWithLazy;
