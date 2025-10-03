import React from 'react';
import { colours } from '../../colours';
import { buildActions, type FormData } from './actionBuilder';

interface JsonPreviewProps {
  formData: FormData;
}

export const JsonPreview: React.FC<JsonPreviewProps> = ({ formData }) => {
  
  const buildPayload = () => {
    const payload: any = {
      timestamp: Date.now(),
      callType: formData.callKind || 'unknown',
      enquiryType: formData.enquiryType,
      
      // Caller Information
      caller: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: `${formData.countryCode}${formData.contactPhone}`,
        category: formData.callerCategory,
      },
      
      // Workflow Logic
      workflow: {
        isClient: formData.isClient,
        contactPreference: formData.contactPreference,
        relationship: formData.relationship,
      },
      
      // Message Details (for messages)
      ...(formData.callKind === 'message' && {
        messageDetails: {
          messageFrom: formData.messageFrom,
          teamMember: formData.teamMember,
          ccTeamMember: formData.ccTeamMember,
          urgent: formData.urgent,
          urgentReason: formData.urgent ? formData.urgentReason : null,
        }
      }),
      
      // Enquiry Details (for enquiries)
      ...(formData.callKind === 'enquiry' && {
        enquiryDetails: {
          areaOfWork: formData.areaOfWork,
          valueInDispute: formData.valueInDispute,
          prospectDescription: formData.prospectDescription,
          constructionOrHomeOwner: formData.constructionOrHomeOwner,
          propertyProfessional: formData.propertyProfessional,
          heardAboutUs: formData.heardAboutUs,
          searchTerm: formData.searchTerm,
          webPageVisited: formData.webPageVisited,
        }
      }),
      
      // General Details
      notes: formData.notes,
      
      // System Actions
      actions: actionSteps,
      
      // Tracking Information
      tracking: {
        claimTime: formData.claimTime,
        contactTime: formData.contactTime,
        abandonTime: formData.abandonTime,
      }
    };

    return payload;
  };

  // Get actions from shared builder
  const actionSteps = buildActions(formData);

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
          {payload.actions.map((action: any, index: number) => (
            <li key={index} style={{ color: colours.darkBlue, marginBottom: '4px' }}>
              <div style={{ fontWeight: 600 }}>{action.description}</div>
              {action.trigger && (
                <div style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '2px' }}>
                  ↳ {action.trigger}
                </div>
              )}
              <div style={{ 
                fontSize: '10px', 
                color: action.status === 'pending' ? '#d13438' : action.status === 'complete' ? '#107c10' : '#605e5c',
                fontWeight: 500,
                marginTop: '2px'
              }}>
                [{action.status.toUpperCase()}]
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JsonPreview;
export type { JsonPreviewProps };