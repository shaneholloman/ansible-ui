import { Chip, ChipGroup, LabelGroup } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageDetail, PageDetails, useGetPageUrl } from '../../../../framework';
import { useOptions } from '../../../common/crud/useOptions';
import { CredentialLabel } from '../../common/CredentialLabel';
import { ExecutionEnvironmentDetail } from '../../common/ExecutionEnvironmentDetail';
import { awxAPI } from '../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { AwxRoute } from '../../main/AwxRoutes';
import { useGetLaunchedByDetails, useGetScheduleUrl, isJobRunning } from './jobUtils';

export function JobExpanded(job: UnifiedJob) {
  const getLaunchedByDetails = useGetLaunchedByDetails();
  const { value: launchedByValue, link: launchedByLink } = useMemo(() => {
    const launchedByDetails = getLaunchedByDetails(job);
    return launchedByDetails ? launchedByDetails : {};
  }, [job, getLaunchedByDetails]);
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/inventory_sources/`);
  const inventorySourceChoices = useMemo(
    () =>
      data &&
      data.actions &&
      data.actions['GET'] &&
      data.actions['GET'].source &&
      Array.isArray(data.actions['GET'].source.choices)
        ? data.actions['GET'].source.choices
        : [],
    [data]
  );
  const getScheduleUrl = useGetScheduleUrl();
  const scheduleUrl = useMemo(() => {
    const scheduleUrl = getScheduleUrl(job);
    return job.summary_fields?.schedule ? (scheduleUrl ? scheduleUrl : '') : '';
  }, [job, getScheduleUrl]);
  const inventoryUrlPaths: { [key: string]: string } = {
    '': 'inventory',
    smart: 'smart_inventory',
    constructed: 'constructed_inventory',
  };

  return (
    <PageDetails disablePadding>
      {job.type === 'inventory_update' && (
        <PageDetail label={t(`Source`)}>
          {inventorySourceChoices?.map(([string, label]) => (string === job.source ? label : null))}
        </PageDetail>
      )}
      <PageDetail label={t(`Launched by`)}>
        {launchedByLink ? <Link to={`${launchedByLink}`}>{launchedByValue}</Link> : launchedByValue}
      </PageDetail>
      {job.launch_type === 'scheduled' &&
        (job.summary_fields?.schedule ? (
          <PageDetail label={t`Schedule`}>
            <Link to={scheduleUrl}>{job.summary_fields?.schedule.name}</Link>
          </PageDetail>
        ) : (
          <PageDetail label={t(`Schedule`)}>{t(`Deleted`)}</PageDetail>
        ))}
      {job.summary_fields?.job_template && (
        <PageDetail label={t`Job template`}>
          <Link
            to={getPageUrl(AwxRoute.JobTemplateDetails, {
              params: { id: job.summary_fields?.job_template?.id },
            })}
          >
            {job.summary_fields?.job_template?.name}
          </Link>
        </PageDetail>
      )}
      {job.summary_fields?.workflow_job_template && (
        <PageDetail label={t`Workflow job template`}>
          <Link
            to={getPageUrl(AwxRoute.WorkflowJobTemplateDetails, {
              params: { id: job.summary_fields?.workflow_job_template.id },
            })}
          >
            {job.summary_fields?.workflow_job_template.name}
          </Link>
        </PageDetail>
      )}
      {job.summary_fields?.source_workflow_job && (
        <PageDetail label={t`Source workflow job`}>
          <Link
            to={getPageUrl(AwxRoute.JobDetails, {
              params: { job_type: 'workflow', id: job.summary_fields.source_workflow_job.id },
            })}
          >
            {job.summary_fields.source_workflow_job.name}
          </Link>
        </PageDetail>
      )}
      {job.summary_fields?.inventory && (
        <PageDetail label={t`Inventory`}>
          <Link
            to={getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                inventory_type: inventoryUrlPaths[job.summary_fields?.inventory.kind],
                id: job.summary_fields?.inventory.id,
              },
            })}
          >
            {job.summary_fields?.inventory.name}
          </Link>
        </PageDetail>
      )}
      {job.summary_fields?.project && (
        <PageDetail label={t`Project`}>
          <Link
            to={getPageUrl(AwxRoute.ProjectDetails, {
              params: { id: job.summary_fields?.project.id },
            })}
          >
            {job.summary_fields?.project.name}
          </Link>
        </PageDetail>
      )}
      {job.type !== 'workflow_job' &&
        !isJobRunning(job.status) &&
        job.status !== 'canceled' &&
        job.summary_fields?.execution_environment && (
          <ExecutionEnvironmentDetail
            executionEnvironment={job.summary_fields.execution_environment}
            isDefaultEnvironment={false}
            verifyMissingVirtualEnv={false}
          />
        )}
      {job.summary_fields?.credentials && (
        <PageDetail label={t`Credentials`} isEmpty={job.summary_fields?.credentials.length === 0}>
          <LabelGroup
            numLabels={5}
            collapsedText={t(`{{count}} more`, {
              count: job.summary_fields.credentials.length - 5,
            })}
          >
            {job.summary_fields.credentials.map((cred) => (
              <CredentialLabel credential={cred} key={cred.id} />
            ))}
          </LabelGroup>
        </PageDetail>
      )}
      {job.summary_fields?.labels && job.summary_fields?.labels.count > 0 && (
        <PageDetail label={t`Labels`}>
          <ChipGroup
            numChips={5}
            collapsedText={t(`{{count}} more`, {
              count: job.summary_fields?.labels.results.length - 5,
            })}
            ouiaId={`job-${job.id}-label-chips`}
          >
            {job.summary_fields?.labels.results.map((l) => (
              <Chip key={l.id} isReadOnly ouiaId={`label-${l.id}-chip`}>
                {l.name}
              </Chip>
            ))}
          </ChipGroup>
        </PageDetail>
      )}
      {job.job_explanation && <PageDetail label={t`Explanation`}>{job.job_explanation}</PageDetail>}
      {typeof job.job_slice_number === 'number' && typeof job.job_slice_count === 'number' && (
        <PageDetail label={t`Job slice`}>{`${
          job.job_slice_number
        }/${job.job_slice_count.toString()}`}</PageDetail>
      )}
      {job.type === 'workflow_job' && job.is_sliced_job && (
        <PageDetail label={t`Job slice parent`}>{t`True`}</PageDetail>
      )}
    </PageDetails>
  );
}
