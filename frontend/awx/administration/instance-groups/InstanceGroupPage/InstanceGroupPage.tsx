import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useInstanceGroupRowActions } from '../hooks/useInstanceGroupActions';

export function InstanceGroupPage() {
  const { t } = useTranslation();
  const activityStream = useViewActivityStream('instance_group');
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: instanceGroup,
    refresh,
  } = useGetItem<InstanceGroup>(awxAPI`/instance_groups`, params.id);

  const itemActions = useInstanceGroupRowActions(() => pageNavigate(AwxRoute.InstanceGroups));
  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!instanceGroup) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={instanceGroup?.name}
        breadcrumbs={[
          {
            label: t('Instance groups'),
            to: getPageUrl(AwxRoute.InstanceGroups),
          },
          {
            label: instanceGroup?.name,
          },
        ]}
        headerActions={
          <PageActions
            actions={[...activityStream, ...itemActions]}
            position={DropdownPosition.right}
            selectedItem={instanceGroup}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Instance Groups'),
          page: AwxRoute.InstanceGroups,
          persistentFilterKey: 'instance_groups',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.InstanceGroupDetails },
          ...(!instanceGroup?.is_container_group
            ? [
                {
                  label: t('Instances'),
                  page: AwxRoute.InstanceGroupInstances,
                },
              ]
            : []),
          { label: t('Team Access'), page: AwxRoute.InstanceGroupTeamAccess },
          { label: t('User Access'), page: AwxRoute.InstanceGroupUserAccess },
          { label: t('Jobs'), page: AwxRoute.InstanceGroupJobs },
        ]}
        params={{ id: instanceGroup.id }}
      />
    </PageLayout>
  );
}
