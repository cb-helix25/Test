// Azure Function endpoint - no authentication needed from client
const AZURE_FUNCTION_ENDPOINT = 'https://web-form-endpoints.azurewebsites.net/api/incoming-calls';

// External API schema interface
export interface ExternalCallSchema {
  firstname: string;
  lastname: string;
  IsTheProspectAPropertyProfessionalLandlordOrATenant: string;
  IsTheProspectAConstructionProfessionalOrAHomeOwner: string;
  AreaOfWork: string;
  TheDisputeHasAMonetaryValueOf: string;
  WhichBestDescribesYou: string;
  notes: string;
  email: string;
  phone: string;
  ref: string;
  id: string;
  taken_by: string;
  call_tag: string;
  call_summary: string;
  transcription: string;
  recording_link: string;
}

// Form data interface (matches existing form structure)
export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  contactPhone: string;
  countryCode: string;
  notes: string;
  areaOfWork?: string;
  propertyDescription?: string;
  constructionDescription?: string;
  callerCategory?: string;
  propertyValue?: string;
  briefSummary?: string;
  callKind: string | null;
  isClient: boolean | null;
  contactPreference: string | null;
  // Add other form fields as needed
}

/**
 * Maps internal form data to external API schema
 * Form data is the source of truth - this function adapts to whatever schema is required
 */
export const mapFormDataToExternalSchema = (formData: FormData): ExternalCallSchema => {
  // Helper function to safely get string values
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  // Map area-specific questions to schema fields
  const mapPropertyQuestion = (): string => {
    if (!formData.propertyDescription) return '';
    
    const mapping: Record<string, string> = {
      'property-professional': 'Property Professional',
      'landlord': 'Landlord', 
      'tenant': 'Tenant',
      'none': 'None of these'
    };
    
    return mapping[formData.propertyDescription] || formData.propertyDescription;
  };

  const mapConstructionQuestion = (): string => {
    if (!formData.constructionDescription) return '';
    
    const mapping: Record<string, string> = {
      'construction-professional': 'Construction Professional',
      'home-owner': 'Home Owner',
      'none': 'None of these'
    };
    
    return mapping[formData.constructionDescription] || formData.constructionDescription;
  };

  const mapAreaOfWork = (): string => {
    if (!formData.areaOfWork) return '';
    
    const mapping: Record<string, string> = {
      'commercial': 'Commercial',
      'construction': 'Construction',
      'employment': 'Employment',
      'property': 'Property',
      'other': 'Other'
    };
    
    return mapping[formData.areaOfWork] || formData.areaOfWork;
  };

  const mapDisputeValue = (): string => {
    if (!formData.propertyValue) return '';
    
    const mapping: Record<string, string> = {
      'less-10k': 'Less than £10,000',
      '10k-50k': '£10,000 - £50,000',
      '50k-100k': '£50,000 - £100,000',
      'greater-100k': 'Greater than £100,000',
      'non-monetary': 'Claim is for something other than money',
      'unsure': 'Unsure'
    };
    
    return mapping[formData.propertyValue] || formData.propertyValue;
  };

  const mapCallerCategory = (): string => {
    if (!formData.callerCategory) return '';
    
    const mapping: Record<string, string> = {
      'property-owner': 'Property Owner',
      'tenant': 'Tenant',
      'director': 'Director',
      'company-owner': 'Company Owner',
      'construction-professional': 'Construction or Property Professional',
      'solicitor': 'Solicitor',
      'other': 'Other'
    };
    
    return mapping[formData.callerCategory] || formData.callerCategory;
  };

  // Build the external schema object
  return {
    firstname: safeString(formData.firstName),
    lastname: safeString(formData.lastName),
    IsTheProspectAPropertyProfessionalLandlordOrATenant: mapPropertyQuestion(),
    IsTheProspectAConstructionProfessionalOrAHomeOwner: mapConstructionQuestion(),
    AreaOfWork: mapAreaOfWork(),
    TheDisputeHasAMonetaryValueOf: mapDisputeValue(),
    WhichBestDescribesYou: mapCallerCategory(),
    notes: safeString(formData.notes || formData.briefSummary),
    email: safeString(formData.email),
    phone: `${formData.countryCode || ''}${formData.contactPhone || ''}`.trim(),
    ref: '', // Not captured in current form
    id: '', // Generated elsewhere or empty
    taken_by: '', // Could be set from user context
    call_tag: safeString(formData.callKind), // Use call kind as tag
    call_summary: safeString(formData.briefSummary),
    transcription: '', // Not captured in current form
    recording_link: '' // Not captured in current form
  };
};



/**
 * Sends form data to Azure Function endpoint with proper authentication
 */
export const sendToAzureFunction = async (formData: FormData): Promise<void> => {
  const externalData = mapFormDataToExternalSchema(formData);
  
  try {
    // Simple call to Azure Function - no authentication needed from client side
    // The Azure Function will handle its own Key Vault access internally
    const requestUrl = AZURE_FUNCTION_ENDPOINT;
    const headers = {
      'Content-Type': 'application/json',
    };
    
    console.log('🚀 Sending to Azure Function:', requestUrl);
    console.log('📦 Payload:', externalData);
    console.log('🔑 Auth headers:', Object.keys(headers).filter(k => k !== 'Content-Type'));
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(externalData),
      // Add CORS handling if needed
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Azure Function call failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
    }

    const responseData = await response.json().catch(() => null);
    console.log('✅ Data successfully sent to Azure Function');
    console.log('� Response:', responseData);
    
  } catch (error) {
    console.error('❌ Failed to send data to Azure Function:', error);
    
    // Provide more specific error guidance
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - check if Azure Function endpoint is accessible and CORS is configured');
    } else if (error instanceof Error && error.message.includes('401')) {
      throw new Error('Authentication failed - check function key or bearer token');
    } else if (error instanceof Error && error.message.includes('403')) {
      throw new Error('Authorization failed - insufficient permissions');
    }
    
    throw error;
  }
};

/**
 * Preview the mapped data without sending
 */
export const previewMappedData = (formData: FormData): ExternalCallSchema => {
  return mapFormDataToExternalSchema(formData);
};