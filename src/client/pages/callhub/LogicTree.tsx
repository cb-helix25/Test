import React from 'react';
import { colours } from '../../colours';
import { ContactPreference } from './types';

interface LogicTreeProps {
  isClient: boolean | null;
  contactPreference: ContactPreference | null;
  relationship: string | null;
  areaOfWork: string | null;
}

interface LogicNode {
  id: string;
  label: string;
  active: boolean;
  children?: LogicNode[];
  action?: string;
  condition?: string;
}

export const LogicTree: React.FC<LogicTreeProps> = ({ 
  isClient, 
  contactPreference, 
  relationship, 
  areaOfWork 
}) => {
  
  const buildLogicTree = (): LogicNode => {
    return {
      id: 'root',
      label: 'Call Processing Logic',
      active: true,
      children: [
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
                      action: '📧 Auto-send email + Calendly link\n📢 Teams message to FE'
                    },
                    {
                      id: 'phone-flow',
                      label: 'Phone Flow', 
                      active: contactPreference === 'phone',
                      action: '📱 Auto-send SMS + Calendly link\n📢 Teams message to FE'
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
                      action: `📧📱 Auto-send email + SMS\n🎯 Hunter card update\n🚨 Alert: ${areaOfWork === 'property' ? 'AC' : areaOfWork === 'construction' ? 'JW' : 'Team'}`
                    },
                    {
                      id: 'other-flow',
                      label: 'Other Relationship',
                      active: Boolean(relationship && relationship !== 'prospect'),
                      action: '📢 Teams message + email to FE'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  };

  const renderNode = (node: LogicNode, depth: number = 0): React.ReactElement => {
    const indent = depth * 20;
    const isExpanded = node.active && node.children && node.children.some(child => child.active);
    
    return (
      <div key={node.id} style={{ marginLeft: indent }}>
        <div 
          style={{
            padding: '8px 12px',
            margin: '2px 0',
            borderRadius: '4px',
            backgroundColor: node.active ? colours.highlightBlue : colours.grey,
            border: `1px solid ${node.active ? colours.blue : colours.greyText}`,
            fontWeight: node.active ? 600 : 400,
            color: node.active ? colours.darkBlue : colours.greyText,
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {node.children && (
              <span style={{ fontSize: '12px' }}>
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            <span>{node.label}</span>
            {node.condition && (
              <span 
                style={{
                  fontSize: '12px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: node.condition === 'pending' ? colours.highlightYellow : colours.highlightBlue,
                  color: colours.darkBlue,
                  fontWeight: 500
                }}
              >
                {node.condition}
              </span>
            )}
          </div>
          
          {node.action && node.active && (
            <div 
              style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: colours.highlightNeutral,
                borderRadius: '3px',
                fontSize: '12px',
                whiteSpace: 'pre-line',
                color: colours.darkBlue
              }}
            >
              <strong>Actions:</strong><br />
              {node.action}
            </div>
          )}
        </div>
        
        {isExpanded && node.children && (
          <div>
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