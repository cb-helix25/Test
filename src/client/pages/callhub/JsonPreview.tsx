import React from 'react';
import { colours } from '../../colours';

interface JsonPreviewProps {
  formData: {
    isClient: boolean | null;
    contactPreference: string | null;
    relationship: string | null;
    firstName: string;
    lastName: string;
    email: string;
    contactPhone: string;
    countryCode: string;
    areaOfWork: string | null;
    notes: string;
    claimTime: number | null;
    contactTime: number | null;
    abandonTime: number | null;
    [key: string]: any;
  };
}

export const JsonPreview: React.FC<JsonPreviewProps> = ({ formData }) => {
  
  const buildPayload = () => {
    const payload: any = {
      timestamp: Date.now(),
      callType: formData.isClient === true ? 'client' : formData.isClient === false ? 'non-client' : 'unknown',
      caller: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: `${formData.countryCode}${formData.contactPhone}`,
      },
      workflow: {
        isClient: formData.isClient,
        contactPreference: formData.contactPreference,
        relationship: formData.relationship,
      },
      caseDetails: {
        areaOfWork: formData.areaOfWork,
        notes: formData.notes,
      },
      actions: buildActions(),
      tracking: {
        claimTime: formData.claimTime,
        contactTime: formData.contactTime,
        abandonTime: formData.abandonTime,
      }
    };

    return payload;
  };

  const buildActions = () => {
    const actions: string[] = [];
    
    if (formData.isClient === true) {
      if (formData.contactPreference === 'email') {
        actions.push('send_email_with_calendly');
        actions.push('send_teams_message_to_fe');
      } else if (formData.contactPreference === 'phone') {
        actions.push('send_sms_with_calendly');
        actions.push('send_teams_message_to_fe');
      }
    } else if (formData.isClient === false) {
      if (formData.relationship === 'prospect') {
        actions.push('send_email_and_sms');
        actions.push('create_hunter_card');
        
        if (formData.areaOfWork === 'property') {
          actions.push('alert_ac');
        } else if (formData.areaOfWork === 'construction') {
          actions.push('alert_jw');
        } else {
          actions.push('alert_team');
        }
      } else {
        actions.push('send_teams_message_to_fe');
        actions.push('send_email_to_fe');
      }
    }
    
    return actions;
  };

  const payload = buildPayload();

  return (
    <div style={{ 
      padding: '16px',
      backgroundColor: colours.sectionBackground,
      border: `1px solid ${colours.grey}`,
      borderRadius: '8px',
      height: 'fit-content'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0',
        color: colours.darkBlue,
        fontSize: '16px',
        fontWeight: 600
      }}>
        📋 JSON Payload
      </h3>
      
      <div style={{
        backgroundColor: colours.websiteBlue,
        color: colours.accent,
        padding: '12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        overflow: 'auto',
        maxHeight: '500px',
        border: `1px solid ${colours.darkBlue}`
      }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
      
      <div style={{
        marginTop: '12px',
        padding: '8px',
        backgroundColor: colours.highlightYellow,
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>Actions to execute:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
          {payload.actions.map((action: string, index: number) => (
            <li key={index} style={{ color: colours.darkBlue }}>
              {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export type { JsonPreviewProps };