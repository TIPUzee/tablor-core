import { RegularFields } from '../stores/fields-store/interfaces'


/**
 * NOTE: Do NOT modify this file, it is used for testing purposes.
 * Some entities' tests depend on this data.
 */


export type SampleItemType = {
    TransactionID: number;
    UserName: string;
    Date: Date;
    Amount: number;
    PaymentMethod: string;
    Status: string;
    TransactionType: string;
}

export const SampleItemFields: RegularFields<SampleItemType> = {
    TransactionID: {
        title: 'Transaction ID',
    },
    UserName: {
        title: 'User Name',
    },
    Date: {
        title: 'Date',
    },
    Amount: {
        title: 'Amount',
    },
    PaymentMethod: {
        title: 'Payment Method',
    },
    Status: {
        title: 'Status',
    },
    TransactionType: {
        title: 'Transaction Type',
    },
}

export const SampleItems: SampleItemType[] = [
  { TransactionID: 1, UserName: 'Zeeshan', Date: new Date('2024-11-10'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 2, UserName: 'Zeeshan', Date: new Date('2024-11-11'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Pending', TransactionType: 'Refund' },
  { TransactionID: 3, UserName: 'Zeeshan', Date: new Date('2024-11-12'), Amount: 2000, PaymentMethod: 'JazzCash', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 4, UserName: 'Zeeshan', Date: new Date('2024-11-10'), Amount: 3000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 5, UserName: 'Zeeshan', Date: new Date('2024-11-12'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Failed', TransactionType: 'Transfer' },
  { TransactionID: 6, UserName: 'Ali', Date: new Date('2024-11-09'), Amount: 4000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Refund' },
  { TransactionID: 7, UserName: 'Ali', Date: new Date('2024-11-08'), Amount: 1500, PaymentMethod: 'Bank Transfer', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 8, UserName: 'Ahmed', Date: new Date('2024-11-07'), Amount: 1000, PaymentMethod: 'JazzCash', Status: 'Completed', TransactionType: 'Transfer' },
  { TransactionID: 9, UserName: 'Ahmed', Date: new Date('2024-11-07'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Refund' },
  { TransactionID: 10, UserName: 'Zeeshan', Date: new Date('2024-11-09'), Amount: 2500, PaymentMethod: 'Credit Card', Status: 'Pending', TransactionType: 'Purchase' },
  { TransactionID: 11, UserName: 'Zeeshan', Date: new Date('2024-11-08'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 12, UserName: 'Zeeshan', Date: new Date('2024-11-10'), Amount: 1200, PaymentMethod: 'Bank Transfer', Status: 'Failed', TransactionType: 'Purchase' },
  { TransactionID: 13, UserName: 'Ali', Date: new Date('2024-11-11'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Pending', TransactionType: 'Purchase' },
  { TransactionID: 14, UserName: 'Ali', Date: new Date('2024-11-08'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Transfer' },
  { TransactionID: 15, UserName: 'Ahmed', Date: new Date('2024-11-08'), Amount: 5000, PaymentMethod: 'JazzCash', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 16, UserName: 'Ahmed', Date: new Date('2024-11-07'), Amount: 3000, PaymentMethod: 'Easypaisa', Status: 'Failed', TransactionType: 'Refund' },
  { TransactionID: 17, UserName: 'Ahmed', Date: new Date('2024-11-06'), Amount: 2000, PaymentMethod: 'JazzCash', Status: 'Completed', TransactionType: 'Transfer' },
  { TransactionID: 18, UserName: 'Zeeshan', Date: new Date('2024-11-05'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 19, UserName: 'Ali', Date: new Date('2024-11-12'), Amount: 5000, PaymentMethod: 'Credit Card', Status: 'Pending', TransactionType: 'Refund' },
  { TransactionID: 20, UserName: 'Zeeshan', Date: new Date('2024-11-09'), Amount: 5000, PaymentMethod: 'JazzCash', Status: 'Failed', TransactionType: 'Transfer' },
  { TransactionID: 21, UserName: 'Zeeshan', Date: new Date('2024-11-08'), Amount: 2000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Refund' },
  { TransactionID: 22, UserName: 'Ahmed', Date: new Date('2024-11-07'), Amount: 5000, PaymentMethod: 'Bank Transfer', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 23, UserName: 'Ahmed', Date: new Date('2024-11-06'), Amount: 2500, PaymentMethod: 'Easypaisa', Status: 'Pending', TransactionType: 'Refund' },
  { TransactionID: 24, UserName: 'Ali', Date: new Date('2024-11-07'), Amount: 3000, PaymentMethod: 'Credit Card', Status: 'Completed', TransactionType: 'Transfer' },
  { TransactionID: 25, UserName: 'Zeeshan', Date: new Date('2024-11-09'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Refund' },
  { TransactionID: 26, UserName: 'Zeeshan', Date: new Date('2024-11-07'), Amount: 5000, PaymentMethod: 'JazzCash', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 27, UserName: 'Ali', Date: new Date('2024-11-11'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Pending', TransactionType: 'Purchase' },
  { TransactionID: 28, UserName: 'Ahmed', Date: new Date('2024-11-06'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 29, UserName: 'Ali', Date: new Date('2024-11-06'), Amount: 2500, PaymentMethod: 'Bank Transfer', Status: 'Completed', TransactionType: 'Refund' },
  { TransactionID: 30, UserName: 'Zeeshan', Date: new Date('2024-11-10'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 31, UserName: 'Ali', Date: new Date('2024-11-05'), Amount: 1000, PaymentMethod: 'Credit Card', Status: 'Completed', TransactionType: 'Transfer' },
  { TransactionID: 32, UserName: 'Zeeshan', Date: new Date('2024-11-05'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Pending', TransactionType: 'Transfer' },
  { TransactionID: 33, UserName: 'Ahmed', Date: new Date('2024-11-06'), Amount: 5000, PaymentMethod: 'Bank Transfer', Status: 'Completed', TransactionType: 'Refund' },
  { TransactionID: 34, UserName: 'Ahmed', Date: new Date('2024-11-09'), Amount: 1500, PaymentMethod: 'Credit Card', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 35, UserName: 'Zeeshan', Date: new Date('2024-11-10'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Completed', TransactionType: 'Refund' },
  { TransactionID: 36, UserName: 'Ali', Date: new Date('2024-11-10'), Amount: 2000, PaymentMethod: 'JazzCash', Status: 'Failed', TransactionType: 'Transfer' },
  { TransactionID: 37, UserName: 'Zeeshan', Date: new Date('2024-11-11'), Amount: 5000, PaymentMethod: 'Easypaisa', Status: 'Pending', TransactionType: 'Purchase' },
  { TransactionID: 38, UserName: 'Ali', Date: new Date('2024-11-08'), Amount: 5000, PaymentMethod: 'JazzCash', Status: 'Completed', TransactionType: 'Purchase' },
  { TransactionID: 39, UserName: 'Zeeshan', Date: new Date('2024-11-09'), Amount: 5000, PaymentMethod: 'Credit Card', Status: 'Completed', TransactionType: 'Transfer' },
  { TransactionID: 40, UserName: 'Ahmed', Date: new Date('2024-11-08'), Amount: 4500, PaymentMethod: 'Easypaisa', Status: 'Failed', TransactionType: 'Refund' }
];
