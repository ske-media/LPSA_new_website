"""Run with Blender's bundled Python. Genuine 3D product renders, scrubbed by scroll."""
import bpy, json, math, os, sys
from pathlib import Path
from mathutils import Vector, Quaternion

ROOT=Path(__file__).resolve().parents[1]
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
preview='--preview' in args
frames=json.loads((ROOT/'public/animations/cup-collapse-v1.json').read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type='METAL';prefs.get_devices()
    for device in prefs.devices: device.use=device.type=='METAL'
    scene.cycles.device='GPU'
except Exception: scene.cycles.device='CPU'
scene.cycles.samples=64
scene.cycles.adaptive_threshold=.015
scene.cycles.use_denoising=True
scene.cycles.max_bounces=6
scene.cycles.transparent_max_bounces=6
scene.cycles.seed=42
scene.render.resolution_x=2560
scene.render.resolution_y=1600
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.film_transparent=False
scene.view_settings.view_transform='AgX'
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.025,.075,.095,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.45

def material(name,color,rough=.3,transmission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough;p.inputs['IOR'].default_value=1.49
    p.inputs['Transmission Weight'].default_value=transmission
    p.inputs['Coat Weight'].default_value=.2;p.inputs['Coat Roughness'].default_value=.22
    return m
plastic=material('Moulded polypropylene',(.8,.87,.9),.32,.12)
prints=[]
for i in range(4):
    m=material('Original LPSA print '+str(i),(.7,.8,.9),.4)
    tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(ROOT/f'.local/cinematic-textures/print-{i}.png'))
    m.node_tree.links.new(tex.outputs['Color'],m.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
    prints.append(m)

# One moulded, hollow mesh: base, tapered outer wall, thin rolled lip, inner wall.
profile=[(0,-.56),(.242,-.56),(.251,-.545),(.313,.513),(.327,.536),(.327,.56),(.314,.56),(.303,.518),(.236,-.519),(0,-.519)]
segments=128;scale=.125
verts=[]
for radius,height in profile:
    for n in range(segments):
        angle=n/segments*math.tau;verts.append((radius*math.cos(angle)*scale,radius*math.sin(angle)*scale,-height*scale))
faces=[]
for ring in range(len(profile)-1):
    for n in range(segments):
        a=ring*segments+n;b=ring*segments+(n+1)%segments;c=(ring+1)*segments+(n+1)%segments;d=(ring+1)*segments+n
        faces.append((a,d,c,b))
mesh=bpy.data.meshes.new('Reusable cup, hollow moulded body');mesh.from_pydata(verts,[],faces);mesh.update()
uv=mesh.uv_layers.new(name='Cylindrical print')
for face in mesh.polygons:
    ring=face.index//segments;n=face.index%segments
    face.use_smooth=True;face.material_index=0 if ring==2 else 1
    # UV follows the genuine tapered outer wall, never a floating decal shell.
    coords=[(n/segments,(profile[ring][1]+.56)/1.12),(n/segments,(profile[ring+1][1]+.56)/1.12),((n+1)/segments,(profile[ring+1][1]+.56)/1.12),((n+1)/segments,(profile[ring][1]+.56)/1.12)]
    for loop,coord in zip(face.loop_indices,coords):uv.data[loop].uv=coord

cups=[]
for i,pose in enumerate(frames[0]):
    instance=mesh.copy();instance.materials.append(prints[i%4]);instance.materials.append(plastic)
    cup=bpy.data.objects.new('Reusable cup %02d'%i,instance);scene.collection.objects.link(cup);cups.append(cup)

floor=material('Wet sapphire studio surface',(.007,.029,.045),.22)
p=floor.node_tree.nodes['Principled BSDF'];p.inputs['Metallic'].default_value=.18
noise=floor.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=38;noise.inputs['Detail'].default_value=4;noise.inputs['Roughness'].default_value=.7
bump=floor.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.24;bump.inputs['Distance'].default_value=.009
floor.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);floor.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.006));bpy.context.object.name='Wet studio floor';bpy.context.object.data.materials.append(floor)

def area(name,position,energy,color,size,target=(0,0,.35)):
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.color=color;data.shape='RECTANGLE';data.size=size;data.size_y=size*.7
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=position;obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
area('Large diffused silver key',(-1.1,-.7,1.7),110,(.73,.88,1),1.1)
area('Blue water edge',(1,.4,1.05),150,(.19,.58,.8),.65)
area('Soft frontal fill',(.2,-1.2,.6),25,(.72,.84,.89),.8)
area('Long specular strip',(-.1,.5,1.5),90,(.76,.93,1),.45)

bpy.ops.object.camera_add();camera=bpy.context.object;scene.camera=camera;camera.data.lens=40;camera.data.shift_x=-.22
camera.data.dof.use_dof=False
scene.render.use_motion_blur=False
focus=bpy.data.objects.new('Focus plane',None);scene.collection.objects.link(focus);camera.data.dof.focus_object=focus

def ease(t):return t*t*(3-2*t)
def clamp(t):return max(0,min(1,t))
def pose(progress):
    fall=clamp((progress-.12)/.48);fr=fall*(len(frames)-1);idx=min(int(fr),len(frames)-2);mix=fr-idx
    rebuild=ease(clamp((progress-.73)/.25))
    for i,cup in enumerate(cups):
        a=frames[idx][i];b=frames[idx+1][i]
        pos=Vector(a['position']).lerp(Vector(b['position']),mix)
        stack=i//7;target=Vector(((stack%3-1)*1.0,.56+(i%7)*.18,(stack//3-.5)*1.0))
        t=ease(clamp((rebuild-i*.001)/.958));pos=pos.lerp(target,t);pos.y+=math.sin(t*math.pi)*.85
        # Cannon Y-up -> Blender Z-up, maintaining rotation convention.
        qa=Quaternion((a['quaternion'][3],a['quaternion'][0],a['quaternion'][1],a['quaternion'][2]));qb=Quaternion((b['quaternion'][3],b['quaternion'][0],b['quaternion'][1],b['quaternion'][2]));q=qa.slerp(qb,mix).slerp(Quaternion((1,0,0),math.pi),t)
        transform=Quaternion((1,0,0),math.pi/2)
        cup.rotation_mode='QUATERNION';cup.rotation_quaternion=transform@q@transform.conjugated()
        cup.location=(pos.x*scale,-pos.z*scale,pos.y*scale)
    target=Vector((0,0,(2.8-fall*1.9+rebuild*.2)*scale))
    camera.location=(.9-progress*.25,-1.7-.25*math.sin(fall*math.pi)+rebuild*.4,.83+.28*math.sin(fall*math.pi)-rebuild*.2)
    camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();focus.location=target

out=ROOT/'.local/cinematic-renders-hq';out.mkdir(parents=True,exist_ok=True)
if preview:
    pose(0);scene.render.filepath=str(out/'hero-preview.png');bpy.ops.render.render(write_still=True)
else:
    count=96
    for frame in range(count):
        pose(frame/(count-1));scene.render.filepath=str(out/f'{frame:03d}.png')
        bpy.ops.render.render(write_still=True);print('CINEMATIC_FRAME',frame,flush=True)
