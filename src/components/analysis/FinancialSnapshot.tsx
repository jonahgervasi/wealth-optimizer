import type { ClientIntake } from "@/types/client";
import { Card } from "@/components/ui/Card";

interface FinancialSnapshotProps {
  intake: ClientIntake;
}

function SnapshotRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-navy-600 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-accent" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function AccountBar({ label, balance, room }: { label: string; balance: number; room: number }) {
  const total = balance + room;
  const fillPct = total > 0 ? (balance / total) * 100 : 0;

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">${balance.toLocaleString()} / ${(total).toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-navy-600 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${Math.min(fillPct, 100)}%` }}
        />
      </div>
      {room > 0 && (
        <div className="text-xs text-slate-500 mt-0.5">
          ${room.toLocaleString()} room available
        </div>
      )}
    </div>
  );
}

export function FinancialSnapshot({ intake }: FinancialSnapshotProps) {
  const goalLabel: Record<string, string> = {
    home_purchase: "Home Purchase",
    retirement: "Retirement",
    wealth_building: "Wealth Building",
    education: "Education (RESP)",
    other: "Other",
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
          Client Profile
        </h3>
        <SnapshotRow
          label="Name"
          value={`${intake.firstName} ${intake.lastName}`}
        />
        <SnapshotRow
          label="Age & Province"
          value={`${intake.age} · ${intake.province}`}
        />
        <SnapshotRow
          label="Annual Income"
          value={`$${intake.annualIncome.toLocaleString()}`}
          highlight
        />
        <SnapshotRow
          label="Marginal Tax Rate"
          value={`${(intake.marginalTaxRate * 100).toFixed(1)}%`}
        />
        <SnapshotRow
          label="Primary Goal"
          value={goalLabel[intake.primaryGoal] || intake.primaryGoal}
        />
        <SnapshotRow
          label="Time Horizon"
          value={`${intake.timeHorizonYears} years`}
        />
        <SnapshotRow
          label="Monthly Budget"
          value={`$${intake.monthlyContributionBudget.toLocaleString()}/mo`}
          highlight
        />
        {intake.isUSPerson && (
          <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
            <p className="text-xs text-yellow-400 font-medium">⚠ US Person — Cross-border complexity</p>
          </div>
        )}
        {intake.hasDBPension && (
          <div className="mt-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
            <p className="text-xs text-blue-400">DB Pension · PA: ${intake.pensionAdjustment.toLocaleString()}</p>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
          Account Utilization
        </h3>
        <AccountBar
          label="TFSA"
          balance={intake.tfsaBalance}
          room={intake.tfsaRoom}
        />
        <AccountBar
          label="RRSP"
          balance={intake.rrspBalance}
          room={intake.rrspRoom}
        />
        {intake.fhsaEligible && (
          <AccountBar
            label="FHSA"
            balance={intake.fhsaBalance}
            room={intake.fhsaRoom}
          />
        )}
        {intake.respEligible && (
          <AccountBar
            label="RESP"
            balance={intake.respBalance}
            room={50000 - intake.respBalance}
          />
        )}
        {intake.nonRegBalance > 0 && (
          <div className="mt-3 pt-3 border-t border-navy-600">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Non-Registered</span>
              <span className="text-white font-medium">${intake.nonRegBalance.toLocaleString()}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
