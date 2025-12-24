import React from 'react';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
var statusColors = {
    normal: '',
    warning: '',
    critical: '',
    success: ''
};
var statusIconColors = {
    normal: 'text-primary',
    warning: 'text-accent',
    critical: 'text-destructive',
    success: 'text-secondary'
};
export function KPICard(_a) {
    var title = _a.title, value = _a.value, unit = _a.unit, change = _a.change, icon = _a.icon, _b = _a.status, status = _b === void 0 ? 'normal' : _b, onClick = _a.onClick, _c = _a.className, className = _c === void 0 ? '' : _c;
    return (<div onClick={onClick} className={"p-3 md:p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer ".concat(statusColors[status], " ").concat(className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2 truncate">{title}</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-xl md:text-2xl font-bold text-foreground break-all">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {unit && <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{unit}</span>}
          </div>
          
          {change && (<div className={"flex items-center gap-1 mt-2 md:mt-3 ".concat(change.isPositive ? 'text-secondary' : 'text-destructive')}>
              {change.isPositive ? (<ArrowUp size={14}/>) : (<ArrowDown size={14}/>)}
              <span className="text-xs font-semibold">
                {Math.abs(change.value)}% {change.isPositive ? 'up' : 'down'}
              </span>
            </div>)}
        </div>

        <div className="p-2 md:p-3 rounded-lg flex-shrink-0">
          {icon ? (<div className={statusIconColors[status]}>
              {icon}
            </div>) : (<TrendingUp className={"w-6 h-6 md:w-8 md:h-8 ".concat(statusIconColors[status])}/>)}
        </div>
      </div>
    </div>);
}
export default KPICard;
