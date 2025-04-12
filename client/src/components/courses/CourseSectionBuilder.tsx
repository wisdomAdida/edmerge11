import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DndContext, 
  MouseSensor, 
  TouchSensor, 
  KeyboardSensor,
  closestCenter,
  DragOverlay,
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SectionItem } from "@/components/courses/SectionItem";
import { MaterialItem } from "@/components/courses/MaterialItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Save } from "lucide-react";
import { AddSectionDialog } from "@/components/courses/AddSectionDialog";
import { AddMaterialDialog } from "@/components/courses/AddMaterialDialog";
import { CourseSection, CourseMaterial } from "@shared/schema";

interface CourseSectionBuilderProps {
  courseId: number;
  initialSections: CourseSection[];
}

export function CourseSectionBuilder({ courseId, initialSections }: CourseSectionBuilderProps) {
  const { toast } = useToast();
  const [sections, setSections] = useState<CourseSection[]>(initialSections.sort((a, b) => a.order - b.order));
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [isAddingMaterialOpen, setIsAddingMaterialOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<CourseSection | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Fetch materials for all sections
  const fetchMaterials = async () => {
    try {
      const promises = sections.map(section => 
        apiRequest("GET", `/api/courses/sections/${section.id}/materials`)
          .then(res => res.json())
      );
      
      const materialsArrays = await Promise.all(promises);
      const allMaterials = materialsArrays.flat();
      setMaterials(allMaterials.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast({
        title: "Error",
        description: "Failed to load course materials.",
        variant: "destructive",
      });
    }
  };

  // Fetch materials when sections change
  useEffect(() => {
    if (sections.length > 0) {
      fetchMaterials();
    } else {
      setMaterials([]);
    }
  }, [sections]);

  // Create section mutation
  const createSection = useMutation({
    mutationFn: async (sectionData: any) => {
      const response = await apiRequest("POST", `/api/courses/${courseId}/sections`, sectionData);
      return response.json();
    },
    onSuccess: (newSection) => {
      setSections(prev => [...prev, newSection]);
      toast({
        title: "Section added",
        description: "The section has been added to your course.",
      });
      setIsAddingSectionOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add section. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create material mutation
  const createMaterial = useMutation({
    mutationFn: async (materialData: any) => {
      const response = await apiRequest(
        "POST", 
        `/api/courses/sections/${activeSectionId}/materials`, 
        materialData
      );
      return response.json();
    },
    onSuccess: (newMaterial) => {
      setMaterials(prev => [...prev, newMaterial]);
      toast({
        title: "Material added",
        description: "The material has been added to the section.",
      });
      setIsAddingMaterialOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add material. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update section order mutation
  const updateSectionOrder = useMutation({
    mutationFn: async ({ id, order }: { id: number, order: number }) => {
      const response = await apiRequest("PUT", `/api/courses/sections/${id}`, { order });
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update section order. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update material order mutation
  const updateMaterialOrder = useMutation({
    mutationFn: async ({ id, order, sectionId }: { id: number, order: number, sectionId?: number }) => {
      const data: any = { order };
      if (sectionId !== undefined) {
        data.sectionId = sectionId;
      }
      const response = await apiRequest("PUT", `/api/courses/materials/${id}`, data);
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update material order. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle section drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    setActiveItemId(activeId);

    if (activeId.startsWith('section-')) {
      const sectionId = parseInt(activeId.replace('section-', ''));
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        setActiveItem(section);
      }
    } else if (activeId.startsWith('material-')) {
      const materialId = parseInt(activeId.replace('material-', ''));
      const material = materials.find(m => m.id === materialId);
      if (material) {
        setActiveItem(material);
      }
    }
  };

  // Handle section drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveItem(null);
      setActiveItemId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) {
      setActiveItem(null);
      setActiveItemId(null);
      return;
    }

    // Handling section reordering
    if (activeId.startsWith('section-') && overId.startsWith('section-')) {
      const activeSectionId = parseInt(activeId.replace('section-', ''));
      const overSectionId = parseInt(overId.replace('section-', ''));
      
      const oldIndex = sections.findIndex(s => s.id === activeSectionId);
      const newIndex = sections.findIndex(s => s.id === overSectionId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        setSections(newSections);
        
        // Update order of all sections
        const updates = newSections.map((section, index) => 
          updateSectionOrder.mutateAsync({ id: section.id, order: index + 1 })
        );
        
        Promise.all(updates)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "sections"] });
          })
          .catch(console.error);
      }
    }
    
    // Handling material reordering within the same section
    else if (activeId.startsWith('material-') && overId.startsWith('material-')) {
      const activeMaterialId = parseInt(activeId.replace('material-', ''));
      const overMaterialId = parseInt(overId.replace('material-', ''));
      
      const activeMaterial = materials.find(m => m.id === activeMaterialId);
      const overMaterial = materials.find(m => m.id === overMaterialId);
      
      if (activeMaterial && overMaterial && activeMaterial.sectionId === overMaterial.sectionId) {
        const sectionMaterials = materials.filter(m => m.sectionId === activeMaterial.sectionId);
        
        const oldIndex = sectionMaterials.findIndex(m => m.id === activeMaterialId);
        const newIndex = sectionMaterials.findIndex(m => m.id === overMaterialId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedSectionMaterials = arrayMove(sectionMaterials, oldIndex, newIndex);
          
          // Update all materials with their new order
          const newMaterials = [...materials];
          reorderedSectionMaterials.forEach((material, index) => {
            const materialIndex = newMaterials.findIndex(m => m.id === material.id);
            if (materialIndex !== -1) {
              newMaterials[materialIndex] = { ...newMaterials[materialIndex], order: index + 1 };
            }
          });
          
          setMaterials(newMaterials);
          
          // Update order in the database
          const updates = reorderedSectionMaterials.map((material, index) => 
            updateMaterialOrder.mutateAsync({ id: material.id, order: index + 1 })
          );
          
          Promise.all(updates)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "materials"] });
            })
            .catch(console.error);
        }
      }
      // Material moved to a different section
      else if (activeMaterial && overMaterial && activeMaterial.sectionId !== overMaterial.sectionId) {
        const newMaterials = [...materials];
        const materialIndex = newMaterials.findIndex(m => m.id === activeMaterialId);
        
        if (materialIndex !== -1) {
          // Update the section ID
          newMaterials[materialIndex] = { 
            ...newMaterials[materialIndex], 
            sectionId: overMaterial.sectionId 
          };
          
          // Reorder materials in the target section
          const targetSectionMaterials = newMaterials.filter(m => m.sectionId === overMaterial.sectionId);
          targetSectionMaterials.sort((a, b) => a.order - b.order);
          
          // Find where to insert the material
          const overIndex = targetSectionMaterials.findIndex(m => m.id === overMaterialId);
          const orderedMaterials = targetSectionMaterials.map((material, index) => ({
            ...material,
            order: index >= overIndex ? index + 2 : index + 1
          }));
          
          // Insert the active material at the right position
          orderedMaterials.splice(overIndex, 0, {
            ...newMaterials[materialIndex],
            order: overIndex + 1
          });
          
          // Update the materials array
          orderedMaterials.forEach(material => {
            const idx = newMaterials.findIndex(m => m.id === material.id);
            if (idx !== -1) {
              newMaterials[idx] = material;
            }
          });
          
          setMaterials(newMaterials);
          
          // Update in the database
          const updates = orderedMaterials.map(material => {
            if (material.id === activeMaterialId) {
              return updateMaterialOrder.mutateAsync({ 
                id: material.id, 
                order: material.order,
                sectionId: overMaterial.sectionId
              });
            } else {
              return updateMaterialOrder.mutateAsync({ 
                id: material.id, 
                order: material.order
              });
            }
          });
          
          Promise.all(updates)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "materials"] });
            })
            .catch(console.error);
        }
      }
    }
    
    // Moving a material to a section (container)
    else if (activeId.startsWith('material-') && overId.startsWith('section-')) {
      const materialId = parseInt(activeId.replace('material-', ''));
      const sectionId = parseInt(overId.replace('section-', ''));
      
      const material = materials.find(m => m.id === materialId);
      
      if (material && material.sectionId !== sectionId) {
        const newMaterials = [...materials];
        const materialIndex = newMaterials.findIndex(m => m.id === materialId);
        
        if (materialIndex !== -1) {
          // Get existing materials in target section
          const sectionMaterials = newMaterials.filter(m => m.sectionId === sectionId);
          const nextOrder = sectionMaterials.length > 0 
            ? Math.max(...sectionMaterials.map(m => m.order)) + 1
            : 1;
          
          // Update the material
          newMaterials[materialIndex] = {
            ...newMaterials[materialIndex],
            sectionId,
            order: nextOrder
          };
          
          setMaterials(newMaterials);
          
          // Update in database
          updateMaterialOrder.mutateAsync({
            id: materialId,
            order: nextOrder,
            sectionId
          })
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "materials"] });
            })
            .catch(console.error);
        }
      }
    }
    
    setActiveItem(null);
    setActiveItemId(null);
  };

  // Handle adding a new section
  const handleAddSection = (sectionData: any) => {
    createSection.mutate({
      ...sectionData,
      courseId,
      order: sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 1
    });
  };

  // Handle adding a new material
  const handleAddMaterial = (materialData: any) => {
    if (!activeSectionId) return;
    
    const sectionMaterials = materials.filter(m => m.sectionId === activeSectionId);
    const nextOrder = sectionMaterials.length > 0 
      ? Math.max(...sectionMaterials.map(m => m.order)) + 1 
      : 1;
    
    createMaterial.mutate({
      ...materialData,
      courseId,
      order: nextOrder
    });
  };

  // Open material dialog for a specific section
  const openAddMaterialDialog = (section: CourseSection) => {
    setActiveSection(section);
    setActiveSectionId(section.id);
    setIsAddingMaterialOpen(true);
  };

  // Save all changes
  const saveChanges = async () => {
    setIsSaving(true);
    
    try {
      // This function mostly serves as a visual indicator since 
      // changes are saved immediately when dragging ends
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Changes saved",
        description: "All course content changes have been saved.",
      });
      
      // Refresh all course data
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "sections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "materials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId] });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get materials for a specific section
  const getSectionMaterials = (sectionId: number) => {
    return materials
      .filter(material => material.sectionId === sectionId)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Content</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddingSectionOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
          <Button onClick={saveChanges} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Add your first course section to begin building your course content.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Button onClick={() => setIsAddingSectionOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(section => `section-${section.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((section) => (
                <SectionItem
                  key={section.id}
                  id={`section-${section.id}`}
                  section={section}
                  materials={getSectionMaterials(section.id)}
                  onAddMaterial={() => openAddMaterialDialog(section)}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem && activeItemId && (
              activeItemId.startsWith('section-') ? (
                <SectionItem
                  id={activeItemId}
                  section={activeItem}
                  materials={getSectionMaterials(activeItem.id)}
                  isDragging
                />
              ) : (
                <MaterialItem
                  id={activeItemId}
                  material={activeItem}
                  isDragging
                />
              )
            )}
          </DragOverlay>
        </DndContext>
      )}

      <AddSectionDialog
        open={isAddingSectionOpen}
        onOpenChange={setIsAddingSectionOpen}
        onAdd={handleAddSection}
        isLoading={createSection.isPending}
      />

      <AddMaterialDialog
        open={isAddingMaterialOpen}
        onOpenChange={setIsAddingMaterialOpen}
        onAdd={handleAddMaterial}
        sectionId={activeSectionId}
        sectionTitle={activeSection?.title || ""}
        isLoading={createMaterial.isPending}
      />
    </div>
  );
}