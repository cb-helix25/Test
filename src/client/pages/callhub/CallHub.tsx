import React, { useState, useEffect } from 'react';
import {
    Stack,
    TextField,
    PrimaryButton,
    MessageBar,
    MessageBarType,
    Dropdown,
    IDropdownOption,
    Checkbox,
    Label,
} from '@fluentui/react';
import './MatterOpeningCard.css';
import { sendCallEvent, lookupClient } from './CallHubApi.mock';
import { EnquiryType, ContactPreference, ClientInfo, CallKind } from './types';
import LogicTree from './LogicTree.tsx';
import JsonPreview from './JsonPreview.tsx';

const CallHub: React.FC = () => {
    // Core call data
    const [callKind, setCallKind] = useState<CallKind | null>(null);
    const [enquiryType, setEnquiryType] = useState<EnquiryType | null>(null);
    const [contactPreference, setContactPreference] = useState<ContactPreference | null>(null);
    const [email, setEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [country, setCountry] = useState('');
    const [notes, setNotes] = useState('');
    const [countryCode, setCountryCode] = useState('+44');
    
    // New logic flow fields
    const [isClient, setIsClient] = useState<boolean | null>(null);
    const [relationship, setRelationship] = useState<string | null>(null);
    const [initialContactMethod, setInitialContactMethod] = useState<string | null>(null);
    const [isSeparateMatter, setIsSeparateMatter] = useState<boolean | null>(null);
    const [autoReroutedFromClientEnquiry, setAutoReroutedFromClientEnquiry] = useState(false);
    
    // System state
    const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
    const [lookupStatus, setLookupStatus] = useState<string | null>(null);
    const [claimTime, setClaimTime] = useState<number | null>(null);
    const [contactTime, setContactTime] = useState<number | null>(null);
    const [abandonTime, setAbandonTime] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [teamMember, setTeamMember] = useState<string | undefined>();
    const [ccTeamMember, setCcTeamMember] = useState('');
    const [urgent, setUrgent] = useState(false);
    const [urgentReason, setUrgentReason] = useState('');
    const [callerCategory, setCallerCategory] = useState<string | undefined>();
    const [messageFrom, setMessageFrom] = useState<string | undefined>();
    const [areaOfWork, setAreaOfWork] = useState<string | undefined>();

    const [heardAboutUs, setHeardAboutUs] = useState<string | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [webPageVisited, setWebPageVisited] = useState('');
    const [briefSummary, setBriefSummary] = useState('');
    
    // Area-specific fields
    const [propertyDescription, setPropertyDescription] = useState<string | undefined>();
    const [propertyValue, setPropertyValue] = useState<string | undefined>();
    const [propertyInterest, setPropertyInterest] = useState<string | undefined>();
    const [employmentDescription, setEmploymentDescription] = useState<string | undefined>();
    const [constructionDescription, setConstructionDescription] = useState<string | undefined>();
    const [constructionValue, setConstructionValue] = useState<string | undefined>();
    const [adjudicationEnquiry, setAdjudicationEnquiry] = useState<string | undefined>();
    const [commercialValue, setCommercialValue] = useState<string | undefined>();
    const [commercialDescription, setCommercialDescription] = useState<string | undefined>();
    const [urgentAssistance, setUrgentAssistance] = useState<string | undefined>();

    useEffect(() => {
        if (callKind !== 'message' || enquiryType !== 'existing') {
            setClientInfo(null);
            setLookupStatus(null);
        }
    }, [callKind, enquiryType]);

    // Reset separate matter flag when call kind changes (but preserve reclassification flags)
    useEffect(() => {
        // Only reset if this is not an automatic reclassification
        if (!autoReroutedFromClientEnquiry) {
            setIsSeparateMatter(null);
        }
        // Don't reset autoReroutedFromClientEnquiry here as it would clear the audit trail
    }, [callKind, autoReroutedFromClientEnquiry]);

    // Note: Existing client + existing matter enquiries will be processed as messages after submission
    // UI stays in enquiry mode to avoid confusion, but backend handles reclassification

    // Helper functions for manual call kind changes
    const handleManualEnquirySelection = () => {
        setCallKind('enquiry');
        // Reset reclassification flags for manual selection
        setIsSeparateMatter(null);
        setAutoReroutedFromClientEnquiry(false);
    };

    const handleManualMessageSelection = () => {
        setCallKind('message');
        // Reset reclassification flags for manual selection
        setIsSeparateMatter(null);
        setAutoReroutedFromClientEnquiry(false);
    };

    const countryCodeOptions: IDropdownOption[] = [
        { key: '+44', text: '+44' },
        { key: '+1', text: '+1' },
        { key: '+61', text: '+61' },
        { key: '+353', text: '+353' },
    ];

    const callerOptions: IDropdownOption[] = [
        { key: 'property-owner', text: 'Property Owner' },
        { key: 'tenant', text: 'Tenant' },
        { key: 'director', text: 'Director' },
        { key: 'company-owner', text: 'Company Owner' },
        { key: 'construction-professional', text: 'Construction or Property Professional' },
        { key: 'solicitor', text: 'Solicitor' },
        { key: 'other', text: 'Unsure/Other' },
    ];

    const teamOptions: IDropdownOption[] = [
        { key: 'Alex Cook', text: 'Alex Cook' },
        { key: "Bianca O'Donnell", text: "Bianca O'Donnell" },
        { key: 'Sam Packwood', text: 'Sam Packwood' },
    ];

    const areaOfWorkOptions: IDropdownOption[] = [
        { key: 'commercial', text: 'commercial' },
        { key: 'construction', text: 'construction' },
        { key: 'employment', text: 'employment' },
        { key: 'property', text: 'property' },
        { key: 'other', text: 'other / unsure' },
    ];



    const hearAboutOptions: IDropdownOption[] = [
        { key: 'google', text: 'google search' },
        { key: 'following', text: 'team/firm following' },
        { key: 'referral', text: 'referral' },
        { key: 'other', text: 'other' },
    ];



    const handleClaim = async () => {
        const now = Date.now();
        setClaimTime(now);
        try {
            await sendCallEvent({
                action: 'claim',
                callKind,
                enquiryType,
                contactPreference,
                email,
                contactPhone,
                callerFirstName: firstName,
                callerLastName: lastName,
                claimTime: now,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleContacted = async () => {
        if (!claimTime) return;
        const now = Date.now();
        setContactTime(now);
        try {
            await sendCallEvent({
                action: 'contact',
                callKind,
                enquiryType,
                contactPreference,
                email,
                contactPhone,
                callerFirstName: firstName,
                callerLastName: lastName,
                claimTime,
                contactTime: now,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleAbandon = async () => {
        if (!claimTime) return;
        const now = Date.now();
        setAbandonTime(now);
        try {
            await sendCallEvent({
                action: 'abandon',
                callKind,
                enquiryType,
                contactPreference,
                email,
                contactPhone,
                callerFirstName: firstName,
                callerLastName: lastName,
                claimTime,
                abandonTime: now,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            await sendCallEvent({
                action: 'save',
                callKind,
                enquiryType,
                contactPreference,
                email,
                contactPhone,
                callerFirstName: firstName,
                callerLastName: lastName,
                notes,
                claimTime,
                contactTime,
                abandonTime,
                teamMember,
                ccTeamMember,
                urgent,
                urgentReason,
                callerCategory,
                messageFrom,
                areaOfWork,
                heardAboutUs,
                searchTerm,
                webPageVisited,
                // Note: New area-specific fields are captured in formData for UI components
                // but not yet sent to backend until API is updated
            });
            setSaveSuccess(true);
        } catch (err: any) {
            setSaveError(err.message || 'Unable to save call');
        } finally {
            setSaving(false);
        }
    };

    const handleLookup = async () => {
        setLookupStatus(null);
        try {
            const info = await lookupClient(countryCode, contactPhone);
            if (info) {
                setClientInfo(info);
                if (info.email) {
                    setEmail(info.email);
                }
            } else {
                setClientInfo(null);
                setLookupStatus('No client found');
            }
        } catch (err) {
            setLookupStatus('Lookup failed');
        }
    };

    const formatDuration = (start: number, end: number) => {
        const ms = end - start;
        return `${(ms / 1000 / 60).toFixed(1)} mins`;
    };

    const missingEmail = (callKind === 'enquiry' || contactPreference === 'email') && !email;
    const canSave =
        !!callKind &&
        (callKind !== 'message' || !!enquiryType) &&
        (callKind === 'message' || !!contactPreference) && // Messages don't need contact preference
        !!contactPhone &&
        !!firstName &&
        !!lastName &&
        !missingEmail &&
        !saving &&
        !abandonTime;

    // Prepare form data for components
    const formData = {
        isClient,
        contactPreference,
        initialContactMethod,
        relationship,
        firstName,
        lastName,
        country,
        email,
        contactPhone,
        countryCode,
        areaOfWork: areaOfWork || null,
        notes,
        claimTime,
        contactTime,
        abandonTime,
        callKind,
        enquiryType,
        callerCategory,
        messageFrom,
        teamMember,
        ccTeamMember,
        urgent,
        urgentReason,
        heardAboutUs,
        searchTerm,
        webPageVisited,
        briefSummary,
        // Workflow gate fields
        isSeparateMatter,
        autoReroutedFromClientEnquiry,
        // Area-specific fields
        propertyDescription,
        propertyValue,
        propertyInterest,
        employmentDescription,
        constructionDescription,
        constructionValue,
        adjudicationEnquiry,
        commercialValue,
        commercialDescription,
        urgentAssistance,
        clientInfo
    };

    return (
        <div className="callhub-layout">
            {/* Main Form */}
            <div className="matter-opening-card">
                <div className="step-header active">
                    <span className="step-title">Call Hub - Real-time Logic</span>
                </div>
                <div className="step-content active">
                    <Stack tokens={{ childrenGap: 20 }}>
                        
                        {/* Call Type Selection */}
                        <div>
                            <Label required>
                                What type of call is this?
                            </Label>
                            <div className="client-type-selection">
                                <div
                                    className={`client-type-icon-btn${callKind === 'enquiry' ? ' active' : ''}`}
                                    onClick={handleManualEnquirySelection}
                                >
                                    <span className="client-type-label">New enquiry</span>
                                </div>
                                <div
                                    className={`client-type-icon-btn${callKind === 'message' ? ' active' : ''}`}
                                    onClick={handleManualMessageSelection}
                                >
                                    <span className="client-type-label">Tel message</span>
                                </div>
                            </div>
                        </div>

                        {/* === CALLER DETAILS SECTION === */}
                        {callKind && (
                            <div style={{ 
                                padding: '20px', 
                                border: '1px solid #e1e5e9', 
                                borderRadius: '8px',
                                backgroundColor: '#f8f9fa' 
                            }}>
                                <h3 style={{ margin: '0 0 16px 0', color: '#323130', fontSize: '16px', fontWeight: 600 }}>
                                    👤 Caller Details
                                </h3>
                                
                                <Stack tokens={{ childrenGap: 16 }}>
                                    <Stack horizontal tokens={{ childrenGap: 8 }}>
                                        <TextField
                                            label="First Name *"
                                            value={firstName}
                                            onChange={(_, v) => setFirstName(v || '')}
                                            required
                                        />
                                        <TextField
                                            label="Last Name *"
                                            value={lastName}
                                            onChange={(_, v) => setLastName(v || '')}
                                            required
                                        />
                                        <TextField
                                            label="Country"
                                            value={country}
                                            onChange={(_, v) => setCountry(v || '')}
                                        />
                                    </Stack>

                                    <Stack horizontal tokens={{ childrenGap: 8 }}>
                                        <Dropdown
                                            label="Code"
                                            selectedKey={countryCode}
                                            options={countryCodeOptions}
                                            onChange={(_, o) => setCountryCode(o?.key as string)}
                                            styles={{ dropdown: { width: 110 } }}
                                        />
                                        <TextField
                                            label="Phone Number"
                                            value={contactPhone}
                                            onChange={(_, v) => setContactPhone(v || '')}
                                        />
                                        <PrimaryButton
                                            text="Lookup Client"
                                            onClick={handleLookup}
                                            disabled={!(callKind === 'message' || (callKind === 'enquiry' && !email))}
                                        />
                                    </Stack>
                                    
                                    {lookupStatus && (
                                        <MessageBar messageBarType={MessageBarType.warning}>{lookupStatus}</MessageBar>
                                    )}
                                    
                                    {clientInfo && (
                                        <div>
                                            <div>
                                                <strong>Point of Contact:</strong> {clientInfo.name} ({clientInfo.email})
                                            </div>
                                            <div>
                                                <strong>Matters</strong>
                                                <ul>
                                                    {clientInfo.matters.map(m => (
                                                        <li key={m}>{m}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {(callKind === 'enquiry' || contactPreference === 'email') && (
                                        <TextField
                                            label="Email"
                                            value={email}
                                            onChange={(_, v) => setEmail(v || '')}
                                            required={callKind === 'enquiry' || contactPreference === 'email'}
                                            description=
                                                {callKind === 'enquiry'
                                                    ? 'Decline enquiry if prospect refuses to give email address unless they genuinely do not have one.'
                                                    : undefined}
                                        />
                                    )}

                                    {missingEmail && (
                                        <div style={{ color: 'red' }}>Cannot proceed without an email address.</div>
                                    )}
                                </Stack>
                            </div>
                        )}

                        {callKind && (
                            <>
                                {/* Message Type Selection */}
                                {callKind === 'message' && (
                                    <div>
                                        <Label required>
                                            What type of message is this?
                                        </Label>
                                        <div className="client-type-selection message-type-grid">
                                            <div
                                                className={`client-type-icon-btn${enquiryType === 'existing' ? ' active' : ''}`}
                                                onClick={() => {
                                                    setEnquiryType('existing');
                                                    setIsClient(true); // Existing client = YES
                                                    setRelationship(null);
                                                }}
                                            >
                                                <span className="client-type-label">Existing Client</span>
                                            </div>
                                            <div
                                                className={`client-type-icon-btn${enquiryType === 'expert' ? ' active' : ''}`}
                                                onClick={() => {
                                                    setEnquiryType('expert');
                                                    setIsClient(false); // Expert = NO
                                                    setRelationship('expert');
                                                }}
                                            >
                                                <span className="client-type-label">Expert</span>
                                            </div>
                                            <div
                                                className={`client-type-icon-btn${enquiryType === 'opposition' ? ' active' : ''}`}
                                                onClick={() => {
                                                    setEnquiryType('opposition');
                                                    setIsClient(false); // Opposition = NO
                                                    setRelationship('opponent');
                                                }}
                                            >
                                                <span className="client-type-label">Opposition</span>
                                            </div>
                                            <div
                                                className={`client-type-icon-btn${enquiryType === 'other' ? ' active' : ''}`}
                                                onClick={() => {
                                                    setEnquiryType('other');
                                                    setIsClient(false); // Other = NO
                                                    setRelationship(null);
                                                }}
                                            >
                                                <span className="client-type-label">Other</span>
                                            </div>
                                        </div>
                                        {enquiryType === 'other' && (
                                            <div style={{ marginTop: '16px' }}>
                                                <Dropdown
                                                    label="What is the relationship to the firm?"
                                                    placeholder="Select relationship..."
                                                    options={[
                                                        { key: 'prospect', text: 'Prospect' },
                                                        { key: 'opponent-solicitor', text: 'Opponent Solicitor' },
                                                        { key: 'barrister', text: 'Barrister' },                                                   
                                                        { key: 'other', text: 'Other' },
                                                    ]}
                                                    selectedKey={relationship}
                                                    onChange={(_, option) => setRelationship(option?.key as string)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Enquiry Flow: Is this a client? */}
                                {callKind === 'enquiry' && (
                                    <div>
                                        <Label required>
                                            Is this a client?
                                        </Label>
                                        <div className="client-type-selection">
                                            <div
                                                className={`client-type-icon-btn${isClient === true ? ' active' : ''}`}
                                                onClick={() => {
                                                    setIsClient(true);
                                                    setRelationship(null);
                                                    setContactPreference(null);
                                                }}
                                            >
                                                <span className="client-type-label">Yes</span>
                                            </div>
                                            <div
                                                className={`client-type-icon-btn${isClient === false ? ' active' : ''}`}
                                                onClick={() => {
                                                    setIsClient(false);
                                                    setContactPreference(null);
                                                    setRelationship(null);
                                                }}
                                            >
                                                <span className="client-type-label">No</span>
                                            </div>
                                        </div>

                                    </div>
                                )}

                        {/* Separate Matter Gate for Existing Clients */}
                        {callKind === 'enquiry' && isClient === true && (
                            <div>
                                <Label required>
                                    Is this about a new/separate matter?
                                </Label>
                                <div className="client-type-selection">
                                    <div
                                        className={`client-type-icon-btn${isSeparateMatter === true ? ' active' : ''}`}
                                        onClick={() => {
                                            setIsSeparateMatter(true);
                                            setContactPreference(null); // Reset for new enquiry flow
                                        }}
                                    >
                                        <span className="client-type-label">Yes - New Matter</span>
                                    </div>
                                    <div
                                        className={`client-type-icon-btn${isSeparateMatter === false ? ' active' : ''}`}
                                        onClick={() => {
                                            setIsSeparateMatter(false);
                                            setAutoReroutedFromClientEnquiry(true); // Flag for post-submission processing
                                        }}
                                    >
                                        <span className="client-type-label">No - Existing Matter</span>
                                    </div>
                                </div>
                                {isSeparateMatter === false && (
                                    <div style={{ 
                                        marginTop: '12px', 
                                        padding: '8px', 
                                        backgroundColor: '#fff4e6', 
                                        border: '1px solid #d6ac00',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        color: '#8a6d00'
                                    }}>
                                        ℹ️ <strong>Note:</strong> This will be processed as a telephone message after submission (existing client + existing matter).
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Client Flow: Contact Preference - Only for new matters */}
                        {callKind === 'enquiry' && isClient === true && isSeparateMatter === true && (
                            <div>
                                <Label required>
                                    Do you prefer contact by email or phone?
                                </Label>
                                <div className="client-type-selection">
                                    <div
                                        className={`client-type-icon-btn${contactPreference === 'email' ? ' active' : ''}`}
                                        onClick={() => setContactPreference('email')}
                                    >
                                        <span className="client-type-label">Email</span>
                                    </div>
                                    <div
                                        className={`client-type-icon-btn${contactPreference === 'phone' ? ' active' : ''}`}
                                        onClick={() => setContactPreference('phone')}
                                    >
                                        <span className="client-type-label">Phone</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Non-Client Flow: Relationship - Only for enquiries, not messages */}
                        {isClient === false && callKind === 'enquiry' && (
                            <div>
                                <Dropdown
                                    label="What is the relationship with the firm? *"
                                    placeholder="Select relationship..."
                                    options={[
                                        { key: 'prospect', text: 'Prospect' },
                                        { key: 'opponent', text: 'Opponent' },
                                        { key: 'opponent-solicitor', text: 'Opponent Solicitor' },
                                        { key: 'barrister', text: 'Barrister' },
                                        { key: 'expert', text: 'Expert' },
                                        { key: 'other', text: 'Other' },
                                    ]}
                                    selectedKey={relationship}
                                    onChange={(_, option) => setRelationship(option?.key as string)}
                                />
                            </div>
                        )}

                        {callKind === 'message' && (
                                    <>
                                        <Dropdown
                                            label="Which best describes caller?"
                                            options={callerOptions}
                                            selectedKey={callerCategory}
                                            onChange={(_, o) => setCallerCategory(o?.key as string)}
                                        />
                                        
                                        <TextField
                                            label="File Reference (if known)"
                                            value={messageFrom}
                                            onChange={(_, v) => setMessageFrom(v || '')}
                                        />

                                        <Dropdown
                                            label="Message for"
                                            options={teamOptions}
                                            selectedKey={teamMember}
                                            onChange={(_, o) => setTeamMember(o?.key as string)}
                                        />
                                        <TextField
                                            label="CC"
                                            value={ccTeamMember}
                                            onChange={(_, v) => setCcTeamMember(v || '')}
                                        />
                                        <Checkbox
                                            label="Urgent"
                                            checked={urgent}
                                            onChange={(_, checked) => setUrgent(!!checked)}
                                        />
                                        {urgent && (
                                            <TextField
                                                label="Urgency Reason"
                                                value={urgentReason}
                                                onChange={(_, v) => setUrgentReason(v || '')}
                                            />
                                        )}
                                    </>
                                )}

                                {callKind === 'enquiry' && (
                                    <>
                                        <Dropdown
                                            label="Area of Work"
                                            options={areaOfWorkOptions}
                                            selectedKey={areaOfWork}
                                            onChange={(_, o) => setAreaOfWork(o?.key as string)}
                                        />

                                        {/* Common fields for all enquiries */}
                                        <Dropdown
                                            label="Value in dispute"
                                            options={[
                                                { key: 'less-10k', text: 'Less than £10,000' },
                                                { key: '10k-50k', text: '£10,000 - £50,000' },
                                                { key: '50k-100k', text: '£50,000 - £100,000' },
                                                { key: 'greater-100k', text: 'Greater than £100,000' },
                                                { key: 'non-monetary', text: 'Claim is for something other than money' },
                                                { key: 'unsure', text: 'Unsure' },
                                            ]}
                                            selectedKey={propertyValue}
                                            onChange={(_, o) => setPropertyValue(o?.key as string)}
                                        />
                                        
                                        <TextField
                                            label="Enquiry notes"
                                            multiline
                                            value={briefSummary}
                                            onChange={(_, v) => setBriefSummary(v || '')}
                                        />

                                        <Dropdown
                                            label="How did you hear about us?"
                                            options={hearAboutOptions}
                                            selectedKey={heardAboutUs}
                                            onChange={(_, o) => setHeardAboutUs(o?.key as string)}
                                        />
                                        
                                        <TextField
                                            label="Search term used"
                                            value={searchTerm}
                                            onChange={(_, v) => setSearchTerm(v || '')}
                                        />
                                        
                                        <TextField
                                            label="Web page visited"
                                            value={webPageVisited}
                                            onChange={(_, v) => setWebPageVisited(v || '')}
                                        />

                                        {/* Area-specific conditional fields */}
                                        {areaOfWork === 'property' && (
                                            <Dropdown
                                                label="Is the prospect a Property Professional, Landlord, or a Tenant?"
                                                options={[
                                                    { key: 'property-professional', text: 'Property Professional' },
                                                    { key: 'landlord', text: 'Landlord' },
                                                    { key: 'tenant', text: 'Tenant' },
                                                    { key: 'none', text: 'None of these' },
                                                ]}
                                                selectedKey={propertyDescription}
                                                onChange={(_, o) => setPropertyDescription(o?.key as string)}
                                            />
                                        )}

                                        {areaOfWork === 'construction' && (
                                            <Dropdown
                                                label="Is the prospect a Construction professional or a Home Owner?"
                                                options={[
                                                    { key: 'construction-professional', text: 'Construction Professional' },
                                                    { key: 'home-owner', text: 'Home Owner' },
                                                    { key: 'none', text: 'None of these' },
                                                ]}
                                                selectedKey={constructionDescription}
                                                onChange={(_, o) => setConstructionDescription(o?.key as string)}
                                            />
                                        )}

                                        {(areaOfWork === 'other' || !areaOfWork) && (
                                            <Dropdown
                                                label="Which best describes you?"
                                                options={[
                                                    { key: 'property-owner', text: 'Property Owner' },
                                                    { key: 'director', text: 'Director' },
                                                    { key: 'construction-property-professional', text: 'Construction or Property Professional' },
                                                    { key: 'tenant', text: 'Tenant' },
                                                    { key: 'company-owner', text: 'Company Owner' },
                                                    { key: 'solicitor', text: 'Solicitor' },
                                                    { key: 'other', text: 'Other' },
                                                ]}
                                                selectedKey={callerCategory}
                                                onChange={(_, o) => setCallerCategory(o?.key as string)}
                                            />
                                        )}
                                    </>
                                )}

                                <TextField
                                    label={callKind === 'message' ? 'Telephone Message' : 'Notes'}
                                    multiline
                                    value={notes}
                                    onChange={(_, v) => setNotes(v || '')}
                                />
                            </>
                        )}

                        {callKind === 'enquiry' && (
                            <div>
                                <strong>Contact Options</strong>
                                <ul>
                                    <li>Email – ~1hr response</li>
                                    <li>WhatsApp – ~1hr response</li>
                                    <li>Calendly – schedule a call</li>
                                    <li>Voicemail – we will return your call</li>
                                </ul>
                            </div>
                        )}

                        <Stack horizontal tokens={{ childrenGap: 10 }}>
                            <PrimaryButton 
                                text="Reset Form" 
                                onClick={() => {
                                    setCallKind(null);
                                    setEnquiryType(null);
                                    setContactPreference(null);
                                    setEmail('');
                                    setContactPhone('');
                                    setFirstName('');
                                    setLastName('');
                                    setCountry('');
                                    setNotes('');
                                    setCountryCode('+44');
                                    setIsClient(null);
                                    setRelationship(null);
                                    setInitialContactMethod(null);
                                    setClientInfo(null);
                                    setLookupStatus(null);
                                    setClaimTime(null);
                                    setContactTime(null);
                                    setAbandonTime(null);
                                    setSaving(false);
                                    setSaveError(null);
                                    setSaveSuccess(false);
                                    setTeamMember(undefined);
                                    setCcTeamMember('');
                                    setUrgent(false);
                                    setUrgentReason('');
                                    setCallerCategory(undefined);
                                    setMessageFrom(undefined);
                                    setAreaOfWork(undefined);
                                    setHeardAboutUs(undefined);
                                    setSearchTerm('');
                                    setWebPageVisited('');
                                    setBriefSummary('');
                                    // Reset area-specific fields
                                    setPropertyDescription(undefined);
                                    setPropertyValue(undefined);
                                    setPropertyInterest(undefined);
                                    setEmploymentDescription(undefined);
                                    setConstructionDescription(undefined);
                                    setConstructionValue(undefined);
                                    setAdjudicationEnquiry(undefined);
                                    setCommercialValue(undefined);
                                    setCommercialDescription(undefined);
                                    setUrgentAssistance(undefined);
                                    // Reset workflow gate fields
                                    setIsSeparateMatter(null);
                                    setAutoReroutedFromClientEnquiry(false);
                                }} 
                            />
                            <PrimaryButton text="Claim Enquiry" onClick={handleClaim} disabled={!!claimTime} />
                            <PrimaryButton text="Mark Contacted" onClick={handleContacted} disabled={!claimTime || !!contactTime} />
                            <PrimaryButton
                                text="Abandon Call"
                                onClick={handleAbandon}
                                disabled={!claimTime || !!contactTime || !!abandonTime}
                            />
                            <PrimaryButton text="Save Call" onClick={handleSave} disabled={!canSave} />
                        </Stack>

                        {claimTime && <div>Claimed at {new Date(claimTime).toLocaleTimeString()}</div>}
                        {claimTime && contactTime && (
                            <div>Time to contact: {formatDuration(claimTime, contactTime)}</div>
                        )}
                        {claimTime && abandonTime && (
                            <div>Time to abandon: {formatDuration(claimTime, abandonTime)}</div>
                        )}
                        {abandonTime && (
                            <div>Abandoned at {new Date(abandonTime).toLocaleTimeString()}</div>
                        )}
                        {saveSuccess && (
                            <MessageBar messageBarType={MessageBarType.success} onDismiss={() => setSaveSuccess(false)}>
                                Call saved
                            </MessageBar>
                        )}
                        {saveError && (
                            <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setSaveError(null)}>
                                {saveError}
                            </MessageBar>
                        )}
                    </Stack>
                </div>
            </div>

            {/* Logic Tree Panel */}
            <div style={{ flex: '1 1 33%', padding: '16px', border: '1px solid #e0e0e0' }}>
                <LogicTree formData={formData} />
            </div>

            {/* JSON Preview Panel */}
            <div style={{ flex: '1 1 33%', padding: '16px', border: '1px solid #e0e0e0' }}>
                <JsonPreview formData={formData} />
            </div>

            <style>{`
          .callhub-layout {
            display: grid;
            grid-template-columns: 1fr 500px 450px;
            gap: 20px;
            padding: 20px;
            max-width: 1800px;
            margin: 0 auto;
          }
          
          @media (max-width: 1400px) {
            .callhub-layout {
              grid-template-columns: 1fr;
              max-width: 800px;
            }
          }
          
          .client-type-selection {
            display: flex;
            gap: 8px;
          }
          
          .message-type-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .client-type-icon-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 14.4px 8px;
            border: 1px solid #e0e0e0;
            background: #f8f8f8;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .client-type-icon-btn .client-type-label {
            pointer-events: none;
          }
          .client-type-icon-btn:not(.active):hover {
            background: #e3f0fc;
            border-color: #3690CE;
          }
          .client-type-icon-btn.active {
            background: #e3f0fc;
            border-color: #3690CE;
            color: #3690CE;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        `}</style>
        </div>
    );
};

export default CallHub;