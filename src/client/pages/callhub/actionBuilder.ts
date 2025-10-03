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
    
    // Special case: Existing client message needs database lookup
    if (formData.enquiryType === 'existing') {
      const hasContactPhone = Boolean(formData.contactPhone);
      const lookupPressed = Boolean(formData.clientInfo); // Assuming clientInfo indicates lookup was performed
      
      actions.push({
        id: 'pa_database_lookup',
        description: 'PA (Power Automate) performs database lookup for existing client',
        trigger: 'Fires when "Lookup Client" button is pressed',
        status: lookupPressed ? 'complete' : hasContactPhone ? 'pending' : 'pending',
        data: {
          phone: formData.contactPhone,
          countryCode: formData.countryCode,
          hasPhone: hasContactPhone
        }
      });
      
      if (lookupPressed) {
        actions.push({
          id: 'pa_retrieve_client_data',
          description: 'PA (Power Automate) retrieves client matters and contact information',
          trigger: 'After successful database lookup',
          status: 'complete',
          data: {
            clientFound: Boolean(formData.clientInfo),
            clientData: formData.clientInfo
          }
        });
      }
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
          status: 'active'
        });
        actions.push({
          id: 'send_teams_message_to_fe',
          description: 'Send Teams notification to fee earner',
          status: 'active'
        });
      } else if (formData.contactPreference === 'phone') {
        actions.push({
          id: 'send_sms_with_calendly',
          description: 'Send SMS with Calendly booking link',
          status: 'active'
        });
        actions.push({
          id: 'send_teams_message_to_fe',
          description: 'Send Teams notification to fee earner',
          status: 'active'
        });
      }
    } else if (formData.isClient === false) {
      if (formData.relationship === 'prospect') {
        actions.push({
          id: 'send_email_and_sms',
          description: 'Send email and SMS to prospect',
          status: 'active'
        });
        actions.push({
          id: 'create_hunter_card',
          description: 'Create Hunter CRM card',
          status: 'active'
        });
        
        if (formData.areaOfWork === 'property') {
          actions.push({
            id: 'alert_ac',
            description: 'Send alert to AC (Property)',
            status: 'active'
          });
        } else if (formData.areaOfWork === 'construction') {
          actions.push({
            id: 'alert_jw',
            description: 'Send alert to JW (Construction)',
            status: 'active'
          });
        } else {
          actions.push({
            id: 'alert_team',
            description: 'Send alert to team',
            status: 'active'
          });
        }
      } else {
        actions.push({
          id: 'send_teams_message_to_fe',
          description: 'Send Teams message to fee earner',
          status: 'active'
        });
        actions.push({
          id: 'send_email_to_fe',
          description: 'Send email to fee earner',
          status: 'active'
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