import { CallEvent, ClientInfo } from './types';

/**
 * Mock implementation for static web app demo
 * In production, replace with real API calls
 */
export async function sendCallEvent(event: CallEvent): Promise<void> {
    // For demo purposes, just log the event
    console.log('Call event (would be sent to backend):', event);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, just store in localStorage for demo
    const events = JSON.parse(localStorage.getItem('callEvents') || '[]');
    events.push({ ...event, timestamp: Date.now() });
    localStorage.setItem('callEvents', JSON.stringify(events));
}

/**
 * Mock client lookup for static web app demo
 */
export async function lookupClient(countryCode: string, phone: string): Promise<ClientInfo | null> {
    console.log('Looking up client:', countryCode, phone);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data for demo
    if (phone === '1234567890') {
        return {
            name: 'John Doe',
            email: 'john.doe@example.com',
            matters: ['Property Dispute #2024-001', 'Contract Review #2024-002']
        };
    }
    
    return null; // No client found
}