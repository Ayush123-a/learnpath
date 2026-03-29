import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Plus, GraduationCap, Trash2 } from "lucide-react";

const CollegeAdminDegrees = () => {
  const { collegeId } = useAuth();
  const [degrees, setDegrees] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDegree, setNewDegree] = useState({ name: "", code: "", duration_years: 3, description: "" });

  const fetchAll = useCallback(async () => {
    if (!collegeId) return;
    setLoading(true);
    const [d, y, s, sub] = await Promise.all([
      supabase.from("degrees").select("*").eq("college_id", collegeId).order("name"),
      supabase.from("years").select("*").order("year_number"),
      supabase.from("semesters").select("*").order("semester_number"),
      supabase.from("subjects").select("*").order("name"),
    ]);
    setDegrees(d.data || []);
    setYears(y.data || []);
    setSemesters(s.data || []);
    setSubjects(sub.data || []);
    setLoading(false);
  }, [collegeId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addDegree = async () => {
    if (!newDegree.name || !newDegree.code) return toast.error("Name and code required");
    const { error } = await supabase.from("degrees").insert({
      name: newDegree.name,
      code: newDegree.code,
      duration_years: newDegree.duration_years,
      description: newDegree.description || null,
      college_id: collegeId,
    });
    if (error) return toast.error(error.message);
    toast.success("Degree added");
    setNewDegree({ name: "", code: "", duration_years: 3, description: "" });
    setShowAdd(false);
    fetchAll();
  };

  const deleteDegree = async (id: string) => {
    const { error } = await supabase.from("degrees").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Degree deleted");
    fetchAll();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("degrees").update({ is_active: !current }).eq("id", id);
    fetchAll();
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> College Degrees</CardTitle>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Degree</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Degree</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={newDegree.name} onChange={(e) => setNewDegree({ ...newDegree, name: e.target.value })} placeholder="Bachelor of Computer Applications" /></div>
              <div><Label>Code</Label><Input value={newDegree.code} onChange={(e) => setNewDegree({ ...newDegree, code: e.target.value })} placeholder="BCA" /></div>
              <div><Label>Duration (years)</Label><Input type="number" value={newDegree.duration_years} onChange={(e) => setNewDegree({ ...newDegree, duration_years: parseInt(e.target.value) || 3 })} /></div>
              <div><Label>Description</Label><Input value={newDegree.description} onChange={(e) => setNewDegree({ ...newDegree, description: e.target.value })} placeholder="Optional description" /></div>
              <Button onClick={addDegree} className="w-full">Create Degree</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {degrees.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No degrees created yet. Add your first degree above.</p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {degrees.map((deg) => {
              const degYears = years.filter((y) => y.degree_id === deg.id);
              const degSemCount = semesters.filter((s) => degYears.some((y) => y.id === s.year_id)).length;
              return (
                <AccordionItem key={deg.id} value={deg.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Badge variant={deg.is_active ? "default" : "secondary"}>{deg.code}</Badge>
                      <span className="font-medium">{deg.name}</span>
                      <span className="text-sm text-muted-foreground">({deg.duration_years}y · {degYears.length} years · {degSemCount} sem)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleActive(deg.id, deg.is_active)}>
                          {deg.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteDegree(deg.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                      {degYears.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No years configured yet.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Year</TableHead>
                              <TableHead>Semesters</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {degYears.map((yr) => {
                              const yrSems = semesters.filter((s) => s.year_id === yr.id);
                              return (
                                <TableRow key={yr.id}>
                                  <TableCell className="font-medium">{yr.label}</TableCell>
                                  <TableCell>{yrSems.map((s) => s.label).join(", ") || "—"}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default CollegeAdminDegrees;
