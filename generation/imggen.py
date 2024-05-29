from flask import Flask, send_file, request
import io
from PIL import Image
from kandinsky2 import get_kandinsky2
import torch
from numba import jit

# !pip install git+https://github.com/ai-forever/Kandinsky-2.git
# !pip install git+https://github.com/openai/CLIP.git
# !pip install opencv-python
# !conda install pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia
# torch.cuda.is_available()
# !nvcc --version
# !pip install numba

app = Flask(__name__)
model = get_kandinsky2(
    'cuda', 
    task_type='text2img', 
    cache_dir='/tmp/kandinsky2', 
    model_version='2.1', 
    use_flash_attention=False
)


def generate_image():
    images = model.generate_text2img(
        "dog, orc, concept art",
        num_steps=40,
        batch_size=1,
        guidance_scale=4,
        h=512,
        w=512,
        sampler='p_sampler', 
        prior_cf_scale=4,
        prior_steps="5"
    )
    # img = Image.new('RGB', (100, 100), color = 'red')
    return images[0]

@app.route('/generate-image', methods=['GET'])
def generate_image_route():
    img = generate_image()
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return send_file(img_byte_arr, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
