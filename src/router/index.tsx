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

// ─────────────────────────────────────────────────────────────
// External Libraries
// ─────────────────────────────────────────────────────────────
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────
// Shared Components
// ─────────────────────────────────────────────────────────────
import ErrorPage from '@shared/pages/error/ErrorPage';
import LoadingSpinner from '@shared/components/ui/LoadingSpinner';

// ─────────────────────────────────────────────────────────────
// Layouts
// ─────────────────────────────────────────────────────────────
import MainLayout from '../layouts/MainLayout';
import ConsultancyLayout from '../layouts/ConsultancyLayout';

// ─────────────────────────────────────────────────────────────
// Pages - Main Layout
// ─────────────────────────────────────────────────────────────
const HomePage = lazy(() => import('@pages/home'));
const Contact = lazy(() => import('@pages/contact'));
const Company = lazy(() => import('@pages/company/_base'));

// ─────────────────────────────────────────────────────────────
// Pages - Legal
// ─────────────────────────────────────────────────────────────
const KVKK = lazy(() => import('@pages/kvkk/_base'));

// ─────────────────────────────────────────────────────────────
// Pages - Consultancy Layout
// ─────────────────────────────────────────────────────────────
const ConsultancyHome = lazy(() => import('@pages/services/consultancy/home/_base'));
const ProjectConsultancy = lazy(() => import('@pages/services/consultancy/project/_base'));
const TechnicalEducation = lazy(
  () => import('@pages/services/consultancy/technical-education/_base')
);
const CentersSetup = lazy(() => import('@pages/services/consultancy/centers/setup/_base'));
const CentersStatisticsRDCenters = lazy(
  () => import('@pages/services/consultancy/centers/statistics/rd-centers/_base')
);
const CentersStatisticsDesignCenters = lazy(
  () => import('@pages/services/consultancy/centers/statistics/design-centers/_base')
);

// ─────────────────────────────────────────────────────────────
// Pages - Standalone (No Layout)
// ─────────────────────────────────────────────────────────────
const UnderConstructionPage = lazy(
  () => import('@shared/pages/under-construction/UnderConstructionPage')
);

// ─────────────────────────────────────────────────────────────
// Router — module scope: parsed by scripts/lib/route-sources.js
// and created once, not per render.
// ─────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/company',
        element: <Company />,
      },
      {
        path: '/kvkk',
        element: <KVKK />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
    ],
  },
  {
    path: '/services/consultancy',
    element: <ConsultancyLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ConsultancyHome />,
      },
      {
        path: 'project',
        element: <ProjectConsultancy />,
      },
      {
        path: 'technical-education',
        element: <TechnicalEducation />,
      },
      {
        path: 'centers/setup',
        element: <CentersSetup />,
      },
      {
        path: 'centers/statistics/rd-centers',
        element: <CentersStatisticsRDCenters />,
      },
      {
        path: 'centers/statistics/design-centers',
        element: <CentersStatisticsDesignCenters />,
      },
    ],
  },
  {
    path: '/under-construction',
    element: <UnderConstructionPage />,
    errorElement: <ErrorPage />,
  },
]);

const AppRouter: React.FC = () => (
  <Suspense fallback={<LoadingSpinner fullscreen />}>
    <RouterProvider router={router} />
  </Suspense>
);

export default AppRouter;
