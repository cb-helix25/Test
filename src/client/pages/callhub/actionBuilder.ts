// Shared action builder for CallHub components
// Centralizes workflow logic between LogicTree and JsonPreview

export interface ActionStep {
  id: string;
  description: string;
  trigger?: string;
  status: 'active' | 'pending' | 'complete';
  data?: Record<string, any>;
}

export interface FormData {
  // Core call data
  callKind: string | null;
  enquiryType: string | null;
  isClient: boolean | null;
  contactPreference: string | null;
  relationship: string | null;
  areaOfWork: string | null;
  
  // Caller details
  firstName: string;
  lastName: string;
  email: string;
  contactPhone: string;
  countryCode: string;
  
  // System tracking
  claimTime: number | null;
  contactTime: number | null;
  abandonTime: number | null;
  clientInfo?: any; // Client lookup result data
  
  // Form fields
  notes: string;
  initialContactMethod: string | null;
  
  // Message-specific fields
  teamMember?: string;
  ccTeamMember?: string;
  urgent?: boolean;
  urgentReason?: string;
  messageFrom?: string;
  
  // Caller categorization
  callerCategory?: string;
  
  // Common enquiry fields
  heardAboutUs?: string;
  searchTerm: string;
  webPageVisited: string;
  briefSummary: string;
  
  // Workflow gate fields
  isSeparateMatter: boolean | null;
  autoReroutedFromClientEnquiry: boolean;
  
  // Area-specific enquiry fields
  propertyDescription?: string;
  propertyValue?: string;
  propertyInterest?: string;
  employmentDescription?: string;
  constructionDescription?: string;
  constructionValue?: string;
  adjudicationEnquiry?: string;
  commercialValue?: string;
  commercialDescription?: string;
  urgentAssistance?: string;
}

export const buildActions = (formData: FormData): ActionStep[] => {
  const actions: ActionStep[] = [];
  
  // Handle rerouted client enquiries (existing client, existing matter)
  if (formData.isClient === true && formData.isSeparateMatter === false && formData.autoReroutedFromClientEnquiry) {
    const hasClaimTime = formData.claimTime !== null;
    const hasTeamMember = Boolean(formData.teamMember);
    
    actions.push({
      id: 'enquiry_reclassified',
      description: 'Client enquiry reclassified as telephone message',
      trigger: 'Existing client calling about existing matter',
      status: 'complete',
      data: {
        originalCallKind: 'enquiry',
        reclassifiedAs: 'message',
        reason: 'existing_client_existing_matter'
      }
    });
    
    // Add the same PA workflow steps as regular messages
    actions.push({
      id: 'activate_pa',
      description: 'Activate PA (Power Automate) system',
      trigger: 'Fires when "Claim Enquiry" is clicked',
      status: hasClaimTime ? 'complete' : 'pending'
    });
    
    actions.push({
      id: 'pa_receive_http_request',
      description: 'PA (Power Automate) receives HTTP request with call data',
      trigger: 'Immediate after PA activation',
      status: hasClaimTime ? 'complete' : 'pending'
    });
    
    actions.push({
      id: 'pa_parse_payload',
      description: 'PA (Power Automate) parses JSON payload and extracts message details',
      trigger: 'After HTTP request received',
      status: hasClaimTime ? 'complete' : 'pending',
      data: {
        recipient: formData.teamMember || 'NOT_SELECTED',
        cc: formData.ccTeamMember || null,
        urgent: formData.urgent || false,
        urgencyReason: formData.urgent ? formData.urgentReason : null,
        rerouted: true
      }
    });
    
    actions.push({
      id: 'pa_send_email',
      description: `Send email to ${formData.teamMember || '[MISSING RECIPIENT]'}${formData.ccTeamMember ? ` (CC: ${formData.ccTeamMember})` : ''}${formData.urgent ? ' [URGENT]' : ''} [REROUTED FROM ENQUIRY]`,
      trigger: 'After payload parsing complete',
      status: hasClaimTime && hasTeamMember ? 'complete' : 'pending',
      data: {
        to: formData.teamMember,
        cc: formData.ccTeamMember,
        urgent: formData.urgent,
        subject: `[EXISTING MATTER] ${formData.urgent ? 'URGENT: ' : ''}Message from ${formData.firstName} ${formData.lastName}`,
        validated: hasTeamMember,
        rerouted: true
      }
    });
    
    return actions;
  }
  
  if (formData.callKind === 'message') {
    // Telephone message workflow - PA integration
    const hasClaimTime = formData.claimTime !== null;
    const hasTeamMember = Boolean(formData.teamMember);
    const hasContactPhone = Boolean(formData.contactPhone);
    const lookupPressed = Boolean(formData.clientInfo); // Assuming clientInfo indicates lookup was performed
    
    // Database lookup applies to all telephone message types
    actions.push({
      id: 'pa_database_lookup',
      description: 'PA (Power Automate) performs database lookup to identify caller',
      trigger: 'Fires when "Lookup Client" button is pressed',
      status: lookupPressed ? 'complete' : hasContactPhone ? 'pending' : 'pending',
      data: {
        phone: formData.contactPhone,
        countryCode: formData.countryCode,
        hasPhone: hasContactPhone,
        messageType: formData.enquiryType
      }
    });
    
    if (lookupPressed) {
      actions.push({
        id: 'pa_retrieve_client_data',
        description: 'PA (Power Automate) retrieves caller information and context',
        trigger: 'After successful database lookup',
        status: 'complete',
        data: {
          callerFound: Boolean(formData.clientInfo),
          callerData: formData.clientInfo,
          messageType: formData.enquiryType
        }
      });
    }
    
    actions.push({
      id: 'activate_pa',
      description: 'Activate PA (Power Automate) system',
      trigger: 'Fires when "Claim Enquiry" is clicked',
      status: hasClaimTime ? 'complete' : 'pending'
    });
    
    actions.push({
      id: 'pa_receive_http_request',
      description: 'PA (Power Automate) receives HTTP request with call data',
      trigger: 'Immediate after PA activation',
      status: hasClaimTime ? 'complete' : 'pending'
    });
    
    actions.push({
      id: 'pa_parse_payload',
      description: 'PA (Power Automate) parses JSON payload and extracts message details',
      trigger: 'After HTTP request received',
      status: hasClaimTime ? 'complete' : 'pending',
      data: {
        recipient: formData.teamMember || 'NOT_SELECTED',
        cc: formData.ccTeamMember || null,
        urgent: formData.urgent || false,
        urgencyReason: formData.urgent ? formData.urgentReason : null
      }
    });
    
    actions.push({
      id: 'pa_send_email',
      description: `Send email to ${formData.teamMember || '[MISSING RECIPIENT]'}${formData.ccTeamMember ? ` (CC: ${formData.ccTeamMember})` : ''}${formData.urgent ? ' [URGENT]' : ''}`,
      trigger: 'After payload parsing complete',
      status: hasClaimTime && hasTeamMember ? 'complete' : 'pending',
      data: {
        to: formData.teamMember,
        cc: formData.ccTeamMember,
        urgent: formData.urgent,
        subject: formData.urgent ? `URGENT: Message from ${formData.firstName} ${formData.lastName}` : `Message from ${formData.firstName} ${formData.lastName}`,
        validated: hasTeamMember
      }
    });
    
  } else if (formData.callKind === 'enquiry') {
    // Enquiry workflow
    if (formData.isClient === true) {
      if (formData.contactPreference === 'email') {
        actions.push({
          id: 'send_email_with_calendly',
          description: 'Send email with Calendly booking link',
          status: 'active',
          trigger: 'Immediate - within 2 minutes of call completion',
          data: {
            template: 'existing_client_email_calendly',
            personalization: 'client_matter_history',
            trackingEnabled: true
          }
        });
        actions.push({
          id: 'send_teams_message_to_fe',
          description: 'Send Teams notification to fee earner',
          status: 'active',
          trigger: 'Immediate - parallel with client email',
          data: {
            recipient: 'assigned_fee_earner',
            priority: 'normal',
            includeClientContext: true,
            deepLinks: ['client_file', 'matter_history', 'calendar']
          }
        });
      } else if (formData.contactPreference === 'phone') {
        actions.push({
          id: 'send_sms_with_calendly',
          description: 'Send SMS with Calendly booking link',
          status: 'active',
          trigger: 'Immediate - within 1 minute of call completion',
          data: {
            template: 'existing_client_sms_calendly',
            personalization: 'client_name_matter_ref',
            mobileOptimized: true,
            deliveryTracking: true
          }
        });
        actions.push({
          id: 'send_teams_message_to_fe',
          description: 'Send Teams notification to fee earner',
          status: 'active',
          trigger: 'Immediate - parallel with client SMS',
          data: {
            recipient: 'assigned_fee_earner',
            priority: 'normal',
            includeClientContext: true,
            communicationHistory: true,
            suggestedCallbackTimes: true
          }
        });
      }
    } else if (formData.isClient === false) {
      if (formData.relationship === 'prospect') {
        actions.push({
          id: 'send_email_and_sms',
          description: 'Launch comprehensive dual-channel prospect communication campaign. Send professionally branded email with firm credentials, area of work expertise, initial consultation offer, and fee structure transparency. Simultaneously send SMS with immediate response option and callback scheduling. Both channels include lead tracking, engagement metrics, and automated follow-up sequences based on prospect behavior.',
          status: 'active',
          trigger: 'Immediate - within 3 minutes of call completion',
          data: {
            emailTemplate: 'prospect_consultation_offer',
            smsTemplate: 'prospect_callback_scheduling',
            leadTracking: true,
            engagementMetrics: true,
            followUpSequence: 'prospect_nurture_campaign'
          }
        });
        actions.push({
          id: 'create_hunter_card',
          description: 'Create comprehensive Hunter CRM prospect card with complete call context, area of work classification, initial needs assessment, contact preferences, and lead scoring. Automatically populate caller details, enquiry specifics, area-specific qualification data, and assign to appropriate fee earner based on expertise matching. Include follow-up task scheduling and lead nurturing workflow activation.',
          status: 'active',
          trigger: 'Immediate - parallel with communication dispatch',
          data: {
            leadScore: 'calculated_from_enquiry_data',
            areaOfWorkMatching: true,
            expertiseBasedAssignment: true,
            followUpTasksCreated: true,
            nurturingWorkflowActive: true
          }
        });
        
        if (formData.areaOfWork === 'property') {
          actions.push({
            id: 'alert_ac',
            description: 'Send priority alert to AC (Property Specialist) with complete property enquiry context including property type, transaction value, urgency indicators, and prospect qualification data. Alert includes property-specific assessment criteria, conflict checking requirements, and immediate action recommendations. Specialist receives mobile notification with property enquiry dashboard access and client context summary.',
            status: 'active',
            trigger: 'Immediate - parallel with prospect communications',
            data: {
              specialist: 'AC_Property',
              priority: 'property_enquiry',
              propertyContext: formData.propertyDescription || 'unspecified',
              transactionValue: formData.propertyValue || 'unspecified',
              conflictCheckRequired: true,
              dashboardAccess: true
            }
          });
        } else if (formData.areaOfWork === 'construction') {
          actions.push({
            id: 'alert_jw',
            description: 'Send priority alert to JW (Construction Specialist) with comprehensive construction enquiry details including project type, dispute value, adjudication requirements, and contractor/client classification. Alert includes construction-specific risk assessment, adjudication timeline considerations, and expert assignment recommendations. Specialist receives immediate notification with construction enquiry dashboard and project context analysis.',
            status: 'active',
            trigger: 'Immediate - parallel with prospect communications',
            data: {
              specialist: 'JW_Construction',
              priority: 'construction_enquiry',
              constructionContext: formData.constructionDescription || 'unspecified',
              disputeValue: formData.constructionValue || 'unspecified',
              adjudicationRequired: formData.adjudicationEnquiry === 'yes',
              riskAssessment: true,
              dashboardAccess: true
            }
          });
        } else {
          actions.push({
            id: 'alert_team',
            description: 'Send coordinated alert to appropriate legal team based on area of work classification. Alert includes complete enquiry assessment, expertise matching recommendations, capacity checking, and case complexity indicators. Team receives collaborative notification with prospect qualification matrix, fee earner assignment suggestions, and immediate response coordination. System automatically routes to available specialists with relevant experience.',
            status: 'active',
            trigger: 'Immediate - parallel with prospect communications',
            data: {
              teamType: 'area_of_work_specialists',
              areaOfWork: formData.areaOfWork || 'general',
              expertiseMatching: true,
              capacityChecking: true,
              complexityIndicators: 'calculated_from_enquiry',
              collaborativeResponse: true
            }
          });
        }
      } else {
        actions.push({
          id: 'send_teams_message_to_fe',
          description: 'Send comprehensive Microsoft Teams notification to assigned fee earner with non-prospect enquiry context including relationship type (opponent, barrister, expert, other), call purpose classification, urgency assessment, and recommended response approach. Message includes caller relationship history, matter context if applicable, and suggested handling protocols based on relationship category.',
          status: 'active',
          trigger: 'Immediate - within 2 minutes of call completion',
          data: {
            relationship: formData.relationship || 'unspecified',
            enquiryType: 'non_prospect',
            urgencyAssessment: 'calculated_from_context',
            handlingProtocol: 'relationship_based',
            matterContext: true
          }
        });
        actions.push({
          id: 'send_email_to_fe',
          description: 'Send detailed email summary to assigned fee earner with complete non-prospect enquiry documentation including caller details, relationship classification, enquiry specifics, area of work context, and follow-up requirements. Email includes structured call notes, relationship management recommendations, and next action scheduling with appropriate response timeframes based on caller relationship type.',
          status: 'active',
          trigger: 'Immediate - parallel with Teams notification',
          data: {
            callDocumentation: 'structured_summary',
            relationshipManagement: true,
            followUpScheduling: true,
            responseTimeframe: 'relationship_appropriate',
            nextActionRecommendations: true
          }
        });
      }
    }
  }
  
  return actions;
};

export const formatActionsForDisplay = (actions: ActionStep[]): string => {
  return actions.map(action => {
    let display = action.description;
    if (action.trigger) {
      display += `\n↳ ${action.trigger}`;
    }
    if (action.status === 'pending') {
      display += ' [PENDING]';
    } else if (action.status === 'complete') {
      display += ' ✓';
    }
    return display;
  }).join('\n\n');
};