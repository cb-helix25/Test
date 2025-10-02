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
    const [notes, setNotes] = useState('');
    const [countryCode, setCountryCode] = useState('+44');
    
    // New logic flow fields
    const [isClient, setIsClient] = useState<boolean | null>(null);
    const [relationship, setRelationship] = useState<string | null>(null);
    const [initialContactMethod, setInitialContactMethod] = useState<string | null>(null);
    
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
    const [valueInDispute, setValueInDispute] = useState<string | undefined>();
    const [prospectDescription, setProspectDescription] = useState<string | undefined>();
    const [constructionOrHomeOwner, setConstructionOrHomeOwner] = useState<string | undefined>();
    const [propertyProfessional, setPropertyProfessional] = useState<string | undefined>();
    const [heardAboutUs, setHeardAboutUs] = useState<string | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [webPageVisited, setWebPageVisited] = useState('');

    useEffect(() => {
        if (callKind !== 'message' || enquiryType !== 'existing') {
            setClientInfo(null);
            setLookupStatus(null);
        }
    }, [callKind, enquiryType]);

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

    const valueOptions: IDropdownOption[] = [
        { key: 'lt10', text: 'Less than £10,000' },
        { key: '10-50', text: '£10,000 to £50,000' },
        { key: '50-100', text: '£50,000 to £100,000' },
        { key: 'gt100', text: 'Greater than £100,000' },
        { key: 'other', text: 'The claim is for something other than money' },
        { key: 'unsure', text: 'unsure' },
    ];

    const prospectOptions: IDropdownOption[] = [
        { key: 'property-owner', text: 'Property Owner' },
        { key: 'tenant', text: 'Tenant' },
        { key: 'director', text: 'Director' },
        { key: 'company-owner', text: 'Company Owner' },
        { key: 'construction-professional', text: 'Construction or Property Professional' },
        { key: 'solicitor', text: 'Solicitor' },
        { key: 'other', text: 'Other' },
    ];

    const constructionHomeOptions: IDropdownOption[] = [
        { key: 'construction-professional', text: 'Construction Professional' },
        { key: 'home-owner', text: 'Home Owner' },
        { key: 'none', text: 'None of these' },
    ];

    const propertyLandlordTenantOptions: IDropdownOption[] = [
        { key: 'property-professional', text: 'Property Professional' },
        { key: 'landlord', text: 'Landlord' },
        { key: 'tenant', text: 'Tenant' },
        { key: 'none', text: 'None of these' },
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
                valueInDispute,
                prospectDescription,
                constructionOrHomeOwner,
                propertyProfessional,
                heardAboutUs,
                searchTerm,
                webPageVisited,
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
        !!contactPreference &&
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
        valueInDispute,
        prospectDescription,
        constructionOrHomeOwner,
        propertyProfessional,
        heardAboutUs,
        searchTerm,
        webPageVisited
    };

    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 400px 350px',
            gap: '20px',
            padding: '20px',
            maxWidth: '1400px',
            margin: '0 auto'
        }}>
            {/* Main Form */}
            <div className="matter-opening-card">
                <div className="step-header active">
                    <span className="step-title">Call Hub - Real-time Logic</span>
                </div>
                <div className="step-content active">
                    <Stack tokens={{ childrenGap: 20 }}>
                        
                        {/* Call Type Selection */}
                        <div>
                            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                                What type of call is this? *
                            </label>
                            <div className="client-type-selection">
                                <div
                                    className={`client-type-icon-btn${callKind === 'enquiry' ? ' active' : ''}`}
                                    onClick={() => setCallKind('enquiry')}
                                >
                                    <span className="client-type-label">New enquiry</span>
                                </div>
                                <div
                                    className={`client-type-icon-btn${callKind === 'message' ? ' active' : ''}`}
                                    onClick={() => setCallKind('message')}
                                >
                                    <span className="client-type-label">Tel message</span>
                                </div>
                            </div>
                        </div>

                        {callKind && (
                            <>
                                {/* Message Type Selection */}
                                {callKind === 'message' && (
                                    <div>
                                        <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                                            What type of message is this? *
                                        </label>
                                        <div className="client-type-selection" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                                        <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                                            Is this a client? *
                                        </label>
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

                        {/* Client Flow: Contact Preference */}
                        {isClient === true && (
                            <div>
                                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                                    Do you prefer contact by email or phone? *
                                </label>
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

                        {/* Caller Details - Always shown after client/non-client selection */}
                        {isClient !== null && (
                            <>
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
                                </Stack>

                                <Stack tokens={{ childrenGap: 8 }}>
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
                                            disabled={!(callKind === 'message' && enquiryType === 'existing')}
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
                                </Stack>

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

                                {callKind === 'enquiry' && (
                                    <div>
                                        <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                                            How did they initially contact us?
                                        </label>
                                        <div className="client-type-selection">
                                            <div
                                                className={`client-type-icon-btn${initialContactMethod === 'email' ? ' active' : ''}`}
                                                onClick={() => setInitialContactMethod('email')}
                                            >
                                                <span className="client-type-label">Email</span>
                                            </div>
                                            <div
                                                className={`client-type-icon-btn${initialContactMethod === 'phone' ? ' active' : ''}`}
                                                onClick={() => setInitialContactMethod('phone')}
                                            >
                                                <span className="client-type-label">Phone</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {missingEmail && (
                                    <div style={{ color: 'red' }}>Cannot proceed without an email address.</div>
                                )}

                                <Dropdown
                                    label="Which best describes caller?"
                                    options={callerOptions}
                                    selectedKey={callerCategory}
                                    onChange={(_, o) => setCallerCategory(o?.key as string)}
                                />

                                {callKind === 'message' && (
                                    <>

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
                                        <Dropdown
                                            label="Value in Dispute"
                                            options={valueOptions}
                                            selectedKey={valueInDispute}
                                            onChange={(_, o) => setValueInDispute(o?.key as string)}
                                        />
                                        <Dropdown
                                            label="Which best describes you?"
                                            options={prospectOptions}
                                            selectedKey={prospectDescription}
                                            onChange={(_, o) => setProspectDescription(o?.key as string)}
                                        />
                                        <Dropdown
                                            label="Is the prospect a Construction Professional or a Home Owner?"
                                            options={constructionHomeOptions}
                                            selectedKey={constructionOrHomeOwner}
                                            onChange={(_, o) => setConstructionOrHomeOwner(o?.key as string)}
                                        />
                                        <Dropdown
                                            label="Is the prospect a Property Professional, Landlord, or a Tenant?"
                                            options={propertyLandlordTenantOptions}
                                            selectedKey={propertyProfessional}
                                            onChange={(_, o) => setPropertyProfessional(o?.key as string)}
                                        />
                                        <Dropdown
                                            label="How did you hear about us?"
                                            options={hearAboutOptions}
                                            selectedKey={heardAboutUs}
                                            onChange={(_, o) => setHeardAboutUs(o?.key as string)}
                                        />
                                        <TextField
                                            label="Search Term Used"
                                            description="What exactly did the caller search for? (e.g., 'commercial dispute solicitor')"
                                            value={searchTerm}
                                            onChange={(_, v) => setSearchTerm(v || '')}
                                        />
                                        <TextField
                                            label="Web Page Visited"
                                            description="If known, what page were they looking at? (e.g., helix-law.com/commercial)"
                                            value={webPageVisited}
                                            onChange={(_, v) => setWebPageVisited(v || '')}
                                        />
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
                                    setValueInDispute(undefined);
                                    setProspectDescription(undefined);
                                    setConstructionOrHomeOwner(undefined);
                                    setPropertyProfessional(undefined);
                                    setHeardAboutUs(undefined);
                                    setSearchTerm('');
                                    setWebPageVisited('');
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
                            </>
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
          .client-type-selection {
            display: flex;
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