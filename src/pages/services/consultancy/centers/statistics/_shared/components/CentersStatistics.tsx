import React, { useState, useEffect } from 'react';
import { Tile, Grid, Column } from '@carbon/react';
import { Education, TaskTools, DocumentTasks, type CarbonIconType } from '@carbon/icons-react';
import { useLocale, useIsClient } from '@shared/hooks';
import { translate } from '@shared/translations';
import type { CenterStatistics as CenterStatisticsType } from '../utils/statisticsDataFetcher';
import './styles/CentersStatistics.scss';
import ChartLoader from '@shared/components/visualization/ChartLoader.tsx';

interface StatisticItemProps {
  label: string;
  value: string | number;
  highlighted?: boolean;
}

const StatisticItem: React.FC<StatisticItemProps> = ({ label, value, highlighted = false }) => (
  <div className={`statistic-item ${highlighted ? 'statistic-item--highlighted' : ''}`}>
    <div className="statistic-item__value">{value.toLocaleString('tr-TR')}</div>
    <div className="statistic-item__label">{label}</div>
  </div>
);

interface StatisticGroupProps {
  title: string;
  items: Array<{ label: string; value: number; highlighted?: boolean }>;
  icon?: CarbonIconType;
}

const StatisticGroup: React.FC<StatisticGroupProps> = ({ title, items, icon: Icon }) => (
  <div className="statistic-group">
    <h4 className="statistic-group__title">
      {Icon && <Icon size={20} className="statistic-group__title-icon" />}
      <span>{title}</span>
    </h4>
    <div className="statistic-group__items">
      {items.map((item, index) => (
        <StatisticItem
          key={index}
          label={item.label}
          value={item.value}
          highlighted={item.highlighted}
        />
      ))}
    </div>
  </div>
);

interface CenterStatisticsProps {
  centerType: 'rd' | 'design';
  centerStatisticsData: CenterStatisticsType | (() => Promise<CenterStatisticsType>);
}

const CenterStatistics: React.FC<CenterStatisticsProps> = ({
  centerType,
  centerStatisticsData: centerStatisticsDataProp,
}) => {
  // Hooks
  const isClient = useIsClient();
  const { locale } = useLocale();
  const t = translate(locale);

  const [centerStatisticsData, setCenterStatisticsData] = useState<CenterStatisticsType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof centerStatisticsDataProp === 'function') {
      // Async data
      setIsLoading(true);
      centerStatisticsDataProp()
        .then((result) => {
          setCenterStatisticsData(result);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      // Sync data
      setCenterStatisticsData(centerStatisticsDataProp);
      setIsLoading(false);
    }
  }, [centerStatisticsDataProp]);

  // Loading or no data state
  if (!isClient || isLoading || !centerStatisticsData) {
    return <ChartLoader></ChartLoader>;
  }

  const centerTypeLabel = t.centerType[centerType];

  return (
    <Grid className="center-statistics-grid-container">
      <Column lg={8} md={4} sm={4} className="center-statistics-grid-column">
        <Tile className="statistic-tile statistic-tile--primary">
          <StatisticItem
            label={t.centersStatistics.activeCenters.replace('{centerType}', centerTypeLabel)}
            value={centerStatisticsData.totalCenters}
            highlighted
          />
        </Tile>
      </Column>
      <Column lg={8} md={4} sm={4} className="center-statistics-grid-column">
        <Tile className="statistic-tile statistic-tile--primary">
          <StatisticItem
            label={t.centersStatistics.totalPersonnel}
            value={centerStatisticsData.totalPersonnel}
            highlighted
          />
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} className="center-statistics-grid-column">
        <Tile className="statistic-tile">
          <StatisticGroup
            title={t.centersStatistics.educationLevel.title}
            icon={Education}
            items={[
              {
                label: t.centersStatistics.educationLevel.bachelor,
                value: centerStatisticsData.educationLevel.bachelor,
              },
              {
                label: t.centersStatistics.educationLevel.master,
                value: centerStatisticsData.educationLevel.master,
              },
              {
                label: t.centersStatistics.educationLevel.doctorate,
                value: centerStatisticsData.educationLevel.doctorate,
              },
            ]}
          />
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} className="center-statistics-grid-column">
        <Tile className="statistic-tile">
          <StatisticGroup
            title={t.centersStatistics.projects.title}
            icon={TaskTools}
            items={[
              {
                label: t.centersStatistics.projects.completed,
                value: centerStatisticsData.projects.completed,
              },
              {
                label: t.centersStatistics.projects.ongoing,
                value: centerStatisticsData.projects.ongoing,
              },
            ]}
          />
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} className="center-statistics-grid-column">
        <Tile className="statistic-tile">
          <StatisticGroup
            title={t.centersStatistics.patents.title}
            icon={DocumentTasks}
            items={[
              {
                label: t.centersStatistics.patents.total,
                value: centerStatisticsData.patents.total,
                highlighted: true,
              },
              {
                label: t.centersStatistics.patents.registered,
                value: centerStatisticsData.patents.registered,
              },
              {
                label: t.centersStatistics.patents.applied,
                value: centerStatisticsData.patents.applied,
              },
            ]}
          />
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} className="center-statistics-grid-column">
        <Tile className="statistic-tile statistic-tile--accent">
          <StatisticItem
            label={t.centersStatistics.foreignPartnership.replace('{centerType}', centerTypeLabel)}
            value={centerStatisticsData.foreignPartnership}
          />
        </Tile>
      </Column>
    </Grid>
  );
};

export default CenterStatistics;
