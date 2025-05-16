import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { API } from '../../api/api';
import { usePathname } from 'expo-router';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
  const path = usePathname();
    const fetchMyInvoices = async () => {
        try {
            const response = await API.listOfInvoices();
            setInvoices(response.data.invoices);
        } catch (error) {
            console.log(error);
        }
    }

    const handlePay = async (invoiceUid) => {
        try {
            const response = await API.payInvoice({inv_uid: invoiceUid})
            console.log("RESPONSE PAYING", response.data)
            fetchMyInvoices();
        } catch (error) {
            console.log("Payment error:", error);
        }
    }

    useEffect(() => {
        fetchMyInvoices();
    }, [path]);

    const renderInvoiceItem = ({ item }) => (
        <View className="bg-white p-4 mb-4 rounded-lg shadow-md">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 font-medium">Invoice #{item.invoice_uid.substring(4, 8)}</Text>
                <Text className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            
            <Text className="text-gray-600 mb-1">Amount: ${item.amount}</Text>
            {/* <Text className="text-gray-600 mb-1">Lesson ID: {item.lesson_id}</Text> */}
            <Text className="text-gray-500 text-sm">
                Generated: {item.generated_at ? new Date(item.generated_at).toLocaleDateString() : 'Not generated'}
            </Text>
            
               {item.status === 'paid' && (
            <Text className="text-gray-500 text-sm">
                Paid on: {item.paid_at ? new Date(item.paid_at).toLocaleDateString() : 'N/A'}
            </Text>
        )}
            
            {item?.status === 'unpaid'  && (
                <TouchableOpacity 
                    className="mt-3 bg-blue-500 py-2 px-4 rounded-lg items-center"
                    onPress={() => handlePay(item.invoice_uid)}
                >
                    <Text className="text-white font-medium">Pay Now</Text>
                </TouchableOpacity>
            )}

                {item?.status === 'canceled_penalty'  && (
                <TouchableOpacity 
                    className="mt-3 bg-blue-500 py-2 px-4 rounded-lg items-center"
                    onPress={() => handlePay(item.invoice_uid)}
                >
                    <Text className="text-white font-medium">Pay Now</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 p-4">
            <Text className="text-2xl font-bold mb-6 text-gray-800">My Invoices</Text>
            
            {invoices.length === 0 ? (
                <Text className="text-gray-500 text-center mt-8">No invoices found</Text>
            ) : (
                <FlatList
                    data={invoices}
                    renderItem={renderInvoiceItem}
                    keyExtractor={(item) => item.invoice_uid}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    )
}

export default Invoices