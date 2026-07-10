/**
 * AWS SES email provider — send(), batch().
 * Uses SES v2 REST API with AWS Signature V4.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';
import { signAwsRequest } from '../../core/signing/awsSigV4.js';

const BASE_TEMPLATE = (region) => `https://email.${region}.amazonaws.com`;

function buildClient() {
  return httpClient({ timeout: 15_000 });
}

/**
 * Send a single email via SES v2.
 * @param {{ to: string|string[], from: string, subject: string, text?: string, html?: string, signal?: AbortSignal }} params
 * @param {{ accessKeyId: string, secretAccessKey: string, region?: string }} credentials
 */
export async function send({ to, from, subject, text, html, replyTo, signal } = {}, { accessKeyId, secretAccessKey, region = 'us-east-1' } = {}) {
  if (!accessKeyId || !secretAccessKey) {
    throw new ConfigurationError('[ses] Missing AWS credentials (accessKeyId, secretAccessKey)', { provider: 'ses' });
  }
  try {
    const base = BASE_TEMPLATE(region);
    const body = JSON.stringify({
      FromEmailAddress: from,
      Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            ...(text && { Text: { Data: text, Charset: 'UTF-8' } }),
            ...(html && { Html: { Data: html, Charset: 'UTF-8' } }),
          },
        },
      },
    });

    const url = `${base}/v2/email/outbound-emails`;
    const headers = await signAwsRequest({
      method: 'POST',
      url,
      body,
      service: 'ses',
      region,
      accessKeyId,
      secretAccessKey,
      headers: { 'Content-Type': 'application/json' },
    });

    const { data } = await buildClient().post(url, body, { headers, signal });
    return { success: true, messageId: data.MessageId };
  } catch (err) {
    throw wrapProviderError(err, 'ses');
  }
}

/**
 * Send a templated email via SES v2.
 */
export async function sendTemplated({ to, from, templateName, templateData, signal } = {}, { accessKeyId, secretAccessKey, region = 'us-east-1' } = {}) {
  if (!accessKeyId || !secretAccessKey) {
    throw new ConfigurationError('[ses] Missing AWS credentials', { provider: 'ses' });
  }
  try {
    const base = BASE_TEMPLATE(region);
    const body = JSON.stringify({
      FromEmailAddress: from,
      Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
      Content: {
        Template: {
          TemplateName: templateName,
          TemplateData: JSON.stringify(templateData),
        },
      },
    });

    const url = `${base}/v2/email/outbound-emails`;
    const headers = await signAwsRequest({
      method: 'POST', url, body, service: 'ses', region, accessKeyId, secretAccessKey,
      headers: { 'Content-Type': 'application/json' },
    });

    const { data } = await buildClient().post(url, body, { headers, signal });
    return { success: true, messageId: data.MessageId };
  } catch (err) {
    throw wrapProviderError(err, 'ses');
  }
}

/**
 * Get sending statistics.
 */
export async function getStats({ signal } = {}, { accessKeyId, secretAccessKey, region = 'us-east-1' } = {}) {
  try {
    const base = BASE_TEMPLATE(region);
    const url = `${base}/v2/email/sending-quota`;
    const headers = await signAwsRequest({
      method: 'GET', url, body: '', service: 'ses', region, accessKeyId, secretAccessKey,
    });
    const { data } = await buildClient().get(url, { headers, signal });
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'ses');
  }
}
