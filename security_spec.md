# Security Specification - WorkflowPro

## Data Invariants
1. Attendance, Reimbursements, Cash Advances, and Leave Requests must be owned by the user who created them.
2. Only Admins can see all records in these collections.
3. Users can only update their own Reimbursement requests if they are still in 'Pending' status.
4. Users cannot change their own roles or privileges.
5. All documents must have a valid `userId` linking to the Auth UID or the registered username.

## The Dirty Dozen Payloads
1. **Unauthorized List**: Authenticated user trying to list all attendance records without a userId filter.
2. **Identity Spoofing**: User A trying to create an attendance record with `userId: "UserB"`.
3. **Privilege Escalation**: User A trying to update their own role to 'admin'.
4. **Orphaned Record**: Creating a reimbursement for a project that doesn't exist.
5. **PII Leak**: Non-admin user trying to list all users' private details.
6. **State Shortcut**: User A marking their own reimbursement as 'Approved'.
7. **Junk ID**: Creating a document with a 2KB string as ID to cause resource exhaustion.
8. **Shadow Update**: Adding a `restricted: true` field to a document via update.
9. **Deletion Theft**: Regular user trying to delete someone else's attendance record.
10. **Query Scraping**: User A trying to query `leaveRequests` where `userId != request.auth.uid`.
11. **Timestamp Manipulation**: User setting `createdAt` to a future date instead of server time.
12. **Unverified Access**: User with unverified email (if required) trying to write data.

## Test Results
- All payloads should return PERMISSION_DENIED.
