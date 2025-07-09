import { useCallback, useEffect, useState } from 'react'
import { useRealTime } from '@/hooks/useRealTime'
import Stats from './components/Stats';
import StaffTable from './components/StaffTable';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import CustomerTable from './components/CustomerTable';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AddAdmin from './components/AddAdmin';
import AddStaff from './components/AddStaff';
import AddCustomer from './components/AddCustomer';

export default function UsersPage() {
	const { data: users } = useRealTime('xtreme_users');
	const { data: customers } = useRealTime('customers', {
		queryParams: { expand: 'user' }
	});

	const [filteredUsers, setFilteredUsers] = useState([]);
	const [selectedData, setSelectedData] = useState('Admins');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogType, setDialogType] = useState('');

	useEffect(() => {
		if (selectedData === 'Admins') {
			setFilteredUsers(users?.filter((user) => user?.role === 'Admin'));
		} else if (selectedData === 'Staffs') {
			// Filter for Staff role users who are NOT customers
			const customerUserIds = customers?.map(customer => customer.user) || [];
			setFilteredUsers(users?.filter((user) => user?.role === 'Staff' && !customerUserIds.includes(user.id)));
		} else if (selectedData === 'Customers') {
			// For customers, we'll use the customers data directly, not filtered users
			setFilteredUsers([]);
		}
	}, [users, selectedData, customers]);

	const handleDialog = useCallback((dialogName) => {
		try {
			console.log("Opening dialog:", dialogName);
			setDialogType(dialogName);
			setDialogOpen(true);
		} catch (error) {
			toast.error(error.message || "An error occurred");
		}
	}, []);

	const handleCloseDialog = useCallback(() => {
		setDialogOpen(false);
		setDialogType('');
	}, []);

	return (
		<main className='p-4'>
			<Stats
				users={users}
				setData={setSelectedData}
			/>
			<Card className={'w-full mt-4'}>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<h1 className='font-bold text-2xl'>{selectedData}</h1>
						{
							selectedData === 'Admins' ? (
								<Button onClick={() => handleDialog('admin_add_dialog')}>
									<p>Add</p>
									<PlusIcon />
								</Button>
							) : (
								selectedData === 'Staffs' ? (
									<Button onClick={() => handleDialog('staff_add_dialog')}>
										<p>Add</p>
										<PlusIcon />
									</Button>
								) : (
									selectedData === 'Customers' ? (
										<Button onClick={() => handleDialog('customer_add_dialog')}>
											<p>Add</p>
											<PlusIcon />
										</Button>
									) : ''
								)
							)
						}
					</div>
				</CardHeader>
				<CardContent>
					{
						selectedData === 'Customers' ? (
							<CustomerTable data={customers} />
						) : (
							<StaffTable data={filteredUsers} />
						)
					}
				</CardContent>
			</Card>

			{/* Dialogs for adding users */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className={dialogType === 'customer_add_dialog' ? "max-w-4xl max-h-[90vh] overflow-y-auto" : "max-w-md"}>
					<DialogTitle>
						{dialogType === 'admin_add_dialog' ? 'Add Admin' :
						 dialogType === 'staff_add_dialog' ? 'Add Staff' :
						 dialogType === 'customer_add_dialog' ? 'Add Customer' : ''}
					</DialogTitle>

					{dialogType === 'admin_add_dialog' && (
						<AddAdmin onClose={handleCloseDialog} />
					)}

					{dialogType === 'staff_add_dialog' && (
						<AddStaff onClose={handleCloseDialog} />
					)}

					{dialogType === 'customer_add_dialog' && (
						<AddCustomer onClose={handleCloseDialog} />
					)}
				</DialogContent>
			</Dialog>
		</main>
	)
};

