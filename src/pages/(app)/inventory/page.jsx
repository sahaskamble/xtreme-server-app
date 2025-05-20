import React, { useCallback, useEffect, useState } from 'react'
import Stats from './components/Stats';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConsumablesTable from './components/ConsumablesTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRealTime } from '@/hooks/useRealTime';
import ProfitProgressBar from '@/components/ProfitProgressBar';

function InventoryPage() {
	const { data: snacks } = useRealTime('inventory')
	const { data: devices } = useRealTime('devices', {
		queryParams: { expand: 'group' }
	})
	const { data: sessions } = useRealTime('sessions')
	const [Stocks, setStocks] = useState([]);
	const [selectedData, setselectedData] = useState('Total Stock');
	const [inventoryProfit, setInventoryProfit] = useState(0);

	// Calculate inventory profit from snacks sales
	useEffect(() => {
		if (sessions && snacks) {
			// Calculate profit from snacks sales in sessions
			const snacksProfit = sessions.reduce((total, session) => {
				return total + (session.snacks_total || 0);
			}, 0);

			setInventoryProfit(snacksProfit);
		}
	}, [sessions, snacks]);

	useEffect(() => {
		const fetchData = async () => {
			switch (selectedData) {
				case 'Stocks':
					setStocks(snacks.filter((snack) => snack?.location === 'Stock'));
					break;
				case 'Fridge':
					setStocks(snacks.filter((snack) => snack?.location === 'Fridge'));
					break;
				case 'Low Stock':
					setStocks(snacks.filter((snack) => snack?.status === 'Low Stock'));
					break;
				default:
					setStocks(snacks);
					break;
			}
		}
		fetchData();
	}, [snacks, selectedData]);

	const handleAdd = useCallback(async (page) => {
		// Open a dialog to add a new inventory item
		// TODO: Implement the dialog using appropriate method for this project
		console.log("Opening dialog to add inventory item:", page);
		// For now, we'll just log this action
	}, []);

	return (
		<section className='h-auto p-4'>
			{/* Profit Progress Bar - Moved to top */}
			<ProfitProgressBar
				currentProfit={inventoryProfit}
				targetProfit={50000}
				title="Inventory Sales Target"
				description="Track your snacks and consumables sales"
				className="mb-4"
			/>

			<Stats snacks={snacks} devices={devices} data={selectedData} setData={setselectedData} />

			<Card className={'w-full mt-4'}>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle>{selectedData}</CardTitle>
						{
							(
								selectedData === 'Total Stock' ? (
									<Button className={'flex items-center'} onClick={() => handleAdd('snack_add_dialog')}>
										<p>Add</p>
										<Plus />
									</Button>
								) : ''
							)
						}
					</div>
				</CardHeader>
				<CardContent>
					<ConsumablesTable data={Stocks} />
				</CardContent>
			</Card>

		</section>
	)
}

export default InventoryPage;
