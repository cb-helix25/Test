import React from 'react';
import { colours } from '../../colours';
import { buildActions, formatActionsForDisplay, type FormData } from './actionBuilder';

interface LogicTreeProps {
  formData: FormData;
}

interface LogicNode {
  id: string;
  label: string;
  active: boolean;
  children?: LogicNode[];
  action?: string;
  condition?: string;
}

export const LogicTree: React.FC<LogicTreeProps> = ({ formData }) => {
  
  // Extract values from formData (mirrors the JSON structure)
  const { 
    callKind, 
    enquiryType, 
    isClient, 
    contactPreference, 
    relationship,
    firstName,
    lastName
  } = formData;

  // Get actions from shared builder
  const actions = buildActions(formData);
  const actionsDisplay = formatActionsForDisplay(actions);
  
  const buildLogicTree = (): LogicNode => {
    return {
      id: 'root',
      label: 'Call Processing Logic',
      active: true,
      children: [
        {
          id: 'call-type',
          label: 'Call Type',
          active: callKind !== null,
          condition: callKind || 'pending',
          children: callKind === 'message' ? [
            {
              id: 'message-type',
              label: 'Message Type',
              active: enquiryType !== null,
              condition: enquiryType || 'pending',
              children: [
                {
                  id: 'message-workflow',
                  label: 'PA Workflow',
                  active: Boolean(firstName && lastName),
                  condition: formData.teamMember ? `To: ${formData.teamMember}${formData.ccTeamMember ? ` (CC: ${formData.ccTeamMember})` : ''}${formData.urgent ? ' [URGENT]' : ''}` : 'Recipient needed',
                  action: callKind === 'message' ? actionsDisplay : 'Process message according to type'
                }
              ]
            }
          ] : callKind === 'enquiry' ? [
            {
              id: 'client-check',
              label: 'Is this a client?',
              active: isClient !== null,
              condition: isClient === null ? 'pending' : isClient ? 'YES' : 'NO',
              children: [
                {
                  id: 'client-yes',
                  label: 'Client Flow',
                  active: isClient === true,
                  children: [
                    {
                      id: 'contact-pref',
                      label: 'Contact Preference?',
                      active: isClient === true && contactPreference !== null,
                      condition: contactPreference || 'pending',
                      children: [
                        {
                          id: 'email-flow',
                          label: 'Email Flow',
                          active: contactPreference === 'email',
                          action: contactPreference === 'email' ? actionsDisplay : undefined
                        },
                        {
                          id: 'phone-flow',
                          label: 'Phone Flow', 
                          active: contactPreference === 'phone',
                          action: contactPreference === 'phone' ? actionsDisplay : undefined
                        }
                      ]
                    }
                  ]
                },
                {
                  id: 'client-no',
                  label: 'Non-Client Flow',
                  active: isClient === false,
                  children: [
                    {
                      id: 'relationship-check',
                      label: 'Relationship with firm?',
                      active: isClient === false && relationship !== null,
                      condition: relationship || 'pending',
                      children: [
                        {
                          id: 'prospect-flow',
                          label: 'Prospect Flow',
                          active: relationship === 'prospect',
                          action: relationship === 'prospect' ? actionsDisplay : undefined
                        },
                        {
                          id: 'other-flow',
                          label: 'Other Relationship',
                          active: Boolean(relationship && relationship !== 'prospect'),
                          action: Boolean(relationship && relationship !== 'prospect') ? actionsDisplay : undefined
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ] : []
        }
      ]
    };
  };

  const renderNode = (node: LogicNode, depth: number = 0): React.ReactElement => {
    const indent = depth * 15;
    const isExpanded = node.children && (node.active || node.children.some(child => child.active));
    
    return (
      <div key={node.id} style={{ marginLeft: indent }}>
        <div 
          style={{
            padding: '6px 10px',
            margin: '1px 0',
            borderRadius: '4px',
            backgroundColor: node.active ? colours.highlightBlue : colours.grey,
            border: `1px solid ${node.active ? colours.blue : colours.greyText}`,
            fontWeight: node.active ? 600 : 400,
            color: node.active ? colours.darkBlue : colours.greyText,
            position: 'relative',
            fontSize: '13px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', flexWrap: 'wrap' }}>
            {node.children && (
              <span style={{ fontSize: '11px', marginTop: '1px', flexShrink: 0 }}>
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{node.label}</span>
            {node.condition && (
              <span 
                style={{
                  fontSize: '11px',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  backgroundColor: node.condition === 'pending' ? colours.highlightYellow : colours.highlightBlue,
                  color: colours.darkBlue,
                  fontWeight: 500,
                  flexShrink: 0,
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {node.condition}
              </span>
            )}
          </div>
          
          {node.action && node.active && (
            <div 
              style={{
                marginTop: '6px',
                padding: '6px',
                backgroundColor: colours.highlightNeutral,
                borderRadius: '3px',
                fontSize: '11px',
                whiteSpace: 'pre-line',
                color: colours.darkBlue,
                wordBreak: 'break-word'
              }}
            >
              <strong>Actions:</strong><br />
              {node.action}
            </div>
          )}
        </div>
        
        {isExpanded && node.children && (
          <div style={{ marginTop: '2px' }}>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const logicTree = buildLogicTree();

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
        🌳 Logic Tree
      </h3>
      <div style={{ fontSize: '14px' }}>
        {renderNode(logicTree)}
      </div>
    </div>
  );
};

export default LogicTree;
export type { LogicTreeProps };