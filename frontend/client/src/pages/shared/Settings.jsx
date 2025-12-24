var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, User, Shield, Bell, Database, Lock } from "lucide-react";
import { useState } from "react";
export default function Settings() {
    var _this = this;
    var toast = useToast().toast;
    var _a = useState(false), isLoading = _a[0], setIsLoading = _a[1];
    // Profile settings state
    var _b = useState({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@imarisha.co.ke",
        phone: "+254700000000",
        position: "Branch Manager"
    }), profileData = _b[0], setProfileData = _b[1];
    // System settings state
    var _c = useState({
        companyName: "Imarisha SACCO",
        companyEmail: "info@imarisha.co.ke",
        companyPhone: "+254700000000",
        address: "Nairobi, Kenya",
        currency: "KES",
        timezone: "Africa/Nairobi",
        language: "en",
        businessType: "sacco"
    }), systemSettings = _c[0], setSystemSettings = _c[1];
    // Notification settings state
    var _d = useState({
        emailNotifications: true,
        smsNotifications: false,
        loanReminders: true,
        paymentAlerts: true,
        systemUpdates: false,
        marketingEmails: false
    }), notifications = _d[0], setNotifications = _d[1];
    // Security settings state
    var _e = useState({
        twoFactorAuth: false,
        sessionTimeout: "30",
        passwordExpiry: "90",
        loginAttempts: "5"
    }), security = _e[0], setSecurity = _e[1];
    var handleProfileSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    // Simulate API call
                    _a.sent();
                    toast({
                        title: "Profile Updated",
                        description: "Your profile has been updated successfully.",
                    });
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    toast({
                        title: "Error",
                        description: "Failed to update profile. Please try again.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSystemSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    // Simulate API call
                    _a.sent();
                    toast({
                        title: "Settings Saved",
                        description: "System settings have been updated successfully.",
                    });
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    toast({
                        title: "Error",
                        description: "Failed to save settings. Please try again.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<Layout>
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account, system preferences, and configurations.</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4"/>
                Profile
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4"/>
                System
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4"/>
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4"/>
                Security
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Database className="h-4 w-4"/>
                Integrations
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5"/>
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={profileData.firstName} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { firstName: e.target.value })); }}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={profileData.lastName} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { lastName: e.target.value })); }}/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={profileData.email} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { email: e.target.value })); }}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={profileData.phone} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { phone: e.target.value })); }}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" value={profileData.position} onChange={function (e) { return setProfileData(__assign(__assign({}, profileData), { position: e.target.value })); }}/>
                  </div>
                  <Button onClick={handleProfileSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5"/>
                    Organization Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" value={systemSettings.companyName} onChange={function (e) { return setSystemSettings(__assign(__assign({}, systemSettings), { companyName: e.target.value })); }}/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Company Email</Label>
                      <Input id="companyEmail" type="email" value={systemSettings.companyEmail} onChange={function (e) { return setSystemSettings(__assign(__assign({}, systemSettings), { companyEmail: e.target.value })); }}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Company Phone</Label>
                      <Input id="companyPhone" type="tel" value={systemSettings.companyPhone} onChange={function (e) { return setSystemSettings(__assign(__assign({}, systemSettings), { companyPhone: e.target.value })); }}/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value={systemSettings.address} onChange={function (e) { return setSystemSettings(__assign(__assign({}, systemSettings), { address: e.target.value })); }}/>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={systemSettings.currency} onValueChange={function (value) { return setSystemSettings(__assign(__assign({}, systemSettings), { currency: value })); }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={systemSettings.timezone} onValueChange={function (value) { return setSystemSettings(__assign(__assign({}, systemSettings), { timezone: value })); }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSystemSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5"/>
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                      </div>
                      <Switch checked={notifications.emailNotifications} onCheckedChange={function (checked) { return setNotifications(__assign(__assign({}, notifications), { emailNotifications: checked })); }}/>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <div className="text-sm text-muted-foreground">Receive notifications via SMS</div>
                      </div>
                      <Switch checked={notifications.smsNotifications} onCheckedChange={function (checked) { return setNotifications(__assign(__assign({}, notifications), { smsNotifications: checked })); }}/>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Loan Reminders</Label>
                        <div className="text-sm text-muted-foreground">Get reminded about loan payments</div>
                      </div>
                      <Switch checked={notifications.loanReminders} onCheckedChange={function (checked) { return setNotifications(__assign(__assign({}, notifications), { loanReminders: checked })); }}/>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Payment Alerts</Label>
                        <div className="text-sm text-muted-foreground">Get notified about payments</div>
                      </div>
                      <Switch checked={notifications.paymentAlerts} onCheckedChange={function (checked) { return setNotifications(__assign(__assign({}, notifications), { paymentAlerts: checked })); }}/>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Updates</Label>
                        <div className="text-sm text-muted-foreground">Receive system update notifications</div>
                      </div>
                      <Switch checked={notifications.systemUpdates} onCheckedChange={function (checked) { return setNotifications(__assign(__assign({}, notifications), { systemUpdates: checked })); }}/>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5"/>
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                      </div>
                      <Switch checked={security.twoFactorAuth} onCheckedChange={function (checked) { return setSecurity(__assign(__assign({}, security), { twoFactorAuth: checked })); }}/>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                        <Select value={security.sessionTimeout} onValueChange={function (value) { return setSecurity(__assign(__assign({}, security), { sessionTimeout: value })); }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                        <Select value={security.passwordExpiry} onValueChange={function (value) { return setSecurity(__assign(__assign({}, security), { passwordExpiry: value })); }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="180">180 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="mr-2">
                      <Lock className="mr-2 h-4 w-4"/>
                      Change Password
                    </Button>
                    <Button variant="outline">
                      <Shield className="mr-2 h-4 w-4"/>
                      Security Log
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations */}
            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5"/>
                    Third-Party Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>SMS Gateway</Label>
                        <div className="text-sm text-muted-foreground">Send SMS notifications to members</div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Email Service</Label>
                        <div className="text-sm text-muted-foreground">Configure email delivery service</div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Payment Gateway</Label>
                        <div className="text-sm text-muted-foreground">Process online payments</div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Mobile Money</Label>
                        <div className="text-sm text-muted-foreground">Integrate with mobile money services</div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </Layout>);
}
