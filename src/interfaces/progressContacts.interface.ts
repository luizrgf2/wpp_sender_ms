export interface ProgressContactsInterface {
    contacts: {
        contact: string,
        state: 'finalized' | 'queue'
    } []
}